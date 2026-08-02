// src/stores/battleground/roomService.ts
import { supabase } from '../../lib/supabaseClient';
import type { PublicRoomItem } from './types';
import { generateRoomCode } from './helpers';

export async function fetchPublicRoomsApi(): Promise<PublicRoomItem[]> {
  const { data: roomRows, error: fetchErr } = await supabase
    .from('rooms')
    .select('id, code, host_player_id, max_players, created_at, room_players(player_name, player_id, status)')
    .eq('is_public', true)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false })
    .limit(30);

  if (fetchErr) throw fetchErr;
  if (!roomRows) return [];

  const validRooms: PublicRoomItem[] = [];
  const emptyRoomIds: string[] = [];

  for (const r of roomRows) {
    const activePlayers = (r.room_players ?? []).filter((p: any) => p.status !== 'eliminated');
    if (activePlayers.length === 0) {
      emptyRoomIds.push(r.id);
      continue;
    }
    const hostPlayer = activePlayers.find((p: any) => p.player_id === r.host_player_id) ?? activePlayers[0];
    validRooms.push({
      id: r.id,
      code: r.code,
      host_player_id: r.host_player_id,
      host_name: hostPlayer?.player_name ?? 'Host',
      max_players: r.max_players ?? 8,
      player_count: activePlayers.length,
      created_at: r.created_at,
    });
  }

  if (emptyRoomIds.length > 0) {
    await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .in('id', emptyRoomIds);
  }

  return validRooms;
}

export async function createRoomApi(myPlayerId: string, myPlayerName: string, isPublic: boolean = true) {
  const code = generateRoomCode();

  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .insert({
      code,
      host_player_id: myPlayerId,
      status: 'waiting',
      is_public: isPublic,
      max_players: 8,
      current_round_num: 1,
    })
    .select()
    .single();

  if (roomErr || !room) throw roomErr ?? new Error('Gagal membuat room baru.');

  const { error: playerErr } = await supabase.from('room_players').insert({
    room_id: room.id,
    player_id: myPlayerId,
    player_name: myPlayerName,
    status: 'alive',
  });

  if (playerErr) throw playerErr;

  return room;
}

export async function joinRoomByCodeApi(code: string, myPlayerId: string, myPlayerName: string) {
  const cleanCode = code.trim().toUpperCase();
  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', cleanCode)
    .eq('status', 'waiting')
    .single();

  if (roomErr || !room) {
    throw new Error('Room tidak ditemukan atau match sudah berjalan.');
  }

  const { data: existingPlayers, error: playersErr } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', room.id);

  if (playersErr) throw playersErr;

  const maxCapacity = room.max_players ?? 8;
  const activeCount = (existingPlayers ?? []).filter((p: any) => p.status === 'alive').length;

  if (activeCount >= maxCapacity) {
    throw new Error(`Room sudah penuh! (Maksimal ${maxCapacity} pemain).`);
  }

  const alreadyJoined = existingPlayers?.some((p: any) => p.player_id === myPlayerId);

  if (alreadyJoined) {
    const { error: updateErr } = await supabase
      .from('room_players')
      .update({
        status: 'alive',
        player_name: myPlayerName,
        eliminated_in_round: null,
        elimination_reason: null,
        final_rank: null,
      })
      .eq('room_id', room.id)
      .eq('player_id', myPlayerId);

    if (updateErr) throw updateErr;
  } else {
    const { error: joinErr } = await supabase.from('room_players').insert({
      room_id: room.id,
      player_id: myPlayerId,
      player_name: myPlayerName,
      status: 'alive',
    });
    if (joinErr) throw joinErr;
  }

  return room;
}

export async function togglePublicApi(roomId: string, currentPublic: boolean) {
  const newPublic = !currentPublic;
  const { error: err } = await supabase
    .from('rooms')
    .update({ is_public: newPublic })
    .eq('id', roomId);

  if (err) throw err;
  return newPublic;
}

export async function leaveRoomApi(rId: string, pid: string, isLobby: boolean, isHost: boolean, iAmAlive: boolean) {
  if (isLobby) {
    await supabase
      .from('room_players')
      .delete()
      .eq('room_id', rId)
      .eq('player_id', pid);

    const { data: remaining } = await supabase
      .from('room_players')
      .select('player_id')
      .eq('room_id', rId)
      .order('joined_at', { ascending: true });

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', rId);
    } else if (isHost) {
      await supabase
        .from('rooms')
        .update({ host_player_id: remaining[0].player_id })
        .eq('id', rId);
    }
  } else if (iAmAlive) {
    await supabase
      .from('room_players')
      .update({ status: 'eliminated', elimination_reason: 'disconnect' })
      .eq('room_id', rId)
      .eq('player_id', pid);
  }
}
