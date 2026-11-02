import { supabase } from '../lib/supabaseClient';

export interface LeaderboardSubmissionParams {
  userId: string;
  username: string;
  submissionScore: number;
  durationSeconds: number;
  questionType: string;
  quizLevel: string;
}

export interface LeaderboardSubmissionResult {
  isNewRecord: boolean;
  recordMessage?: string;
}

export const submitLeaderboardScore = async (
  params: LeaderboardSubmissionParams
): Promise<LeaderboardSubmissionResult> => {
  const { userId, submissionScore, durationSeconds, questionType, quizLevel } = params;
  const username = params.username.includes('@') ? params.username.split('@')[0] : params.username;

  try {
    let isNewRecord = false;
    let recordMessage = '';

    // 1. Check Personal Best Score (Skor tertinggi sesi kuis pribadi untuk tipe kuis ini)
    if (submissionScore > 0) {
      const { data: userBestScores } = await supabase
        .from('leaderboard')
        .select('score')
        .eq('user_id', userId)
        .eq('quiz_type', questionType)
        .order('score', { ascending: false })
        .limit(1);

      const prevPersonalBest = userBestScores && userBestScores.length > 0 ? userBestScores[0].score : 0;
      if (submissionScore > prevPersonalBest && prevPersonalBest > 0) {
        isNewRecord = true;
        recordMessage = 'Rekor Skor Tertinggi Pribadi!';
      }
    }

    // 2. Check Global Cumulative Rank Milestones
    const { data: topCumulative } = await supabase
      .from('leaderboard_cumulative')
      .select('total_score, username')
      .limit(10);

    const { data: userPrev } = await supabase
      .from('leaderboard_cumulative')
      .select('total_score')
      .eq('username', username)
      .maybeSingle();

    const prevTotal = userPrev?.total_score || 0;
    const newTotalScore = prevTotal + submissionScore;

    if (topCumulative && topCumulative.length > 0) {
      const highestTopScore = Math.max(...topCumulative.map(r => r.total_score || 0));
      const lowestTopScore = topCumulative.length >= 10
        ? Math.min(...topCumulative.map(r => r.total_score || 0))
        : 0;

      // Merebut peringkat #1 Global
      if (newTotalScore > highestTopScore && prevTotal <= highestTopScore) {
        isNewRecord = true;
        recordMessage = '#1 Rekor Tertinggi Global!';
      }
      // Tembus Top 10 pertama kali
      else if (topCumulative.length >= 10 && prevTotal < lowestTopScore && newTotalScore >= lowestTopScore) {
        isNewRecord = true;
        recordMessage = 'Masuk Top 10 Leaderboard!';
      }
    }

    // 3. Check Global Speed Record (Hanya jika berhasil menyelesaikan skor memadai dan lebih cepat dari rank 1 global)
    if (submissionScore >= 16) {
      const { data: topSpeed } = await supabase
        .from('leaderboard_speed')
        .select('duration_seconds')
        .order('duration_seconds', { ascending: true })
        .limit(1);

      if (topSpeed && topSpeed.length > 0 && topSpeed[0].duration_seconds > 0) {
        if (durationSeconds < topSpeed[0].duration_seconds) {
          isNewRecord = true;
          recordMessage = 'Rekor Waktu Tercepat Global!';
        }
      }
    }

    const { error } = await supabase
      .from('leaderboard')
      .insert({
        user_id: userId,
        username: username,
        score: submissionScore,
        duration_seconds: durationSeconds,
        quiz_type: questionType,
        quiz_level: quizLevel
      });

    if (error) throw error;
    console.log('Successfully submitted score to leaderboard!');
    return { isNewRecord, recordMessage };
  } catch (err) {
    console.error('Failed to submit to leaderboard:', err);
    return { isNewRecord: false };
  }
};
