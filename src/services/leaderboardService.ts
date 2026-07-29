import { supabase } from '../lib/supabaseClient';

export interface LeaderboardSubmissionParams {
  userId: string;
  username: string;
  submissionScore: number;
  durationSeconds: number;
  questionType: string;
  quizLevel: string;
}

export const submitLeaderboardScore = async (
  params: LeaderboardSubmissionParams
): Promise<{ isNewRecord: boolean }> => {
  const { userId, username, submissionScore, durationSeconds, questionType, quizLevel } = params;

  try {
    // 1. Check speed leaderboard
    const { data: topSpeed } = await supabase
      .from('leaderboard_speed')
      .select('duration_seconds')
      .limit(10);
      
    let isSpeedRecord = false;
    if (!topSpeed || topSpeed.length < 10) {
      isSpeedRecord = true;
    } else {
      const slowestTopTime = Math.max(...topSpeed.map(r => r.duration_seconds));
      if (durationSeconds < slowestTopTime) {
        isSpeedRecord = true;
      }
    }
    
    // 2. Check cumulative leaderboard
    const { data: topCumulative } = await supabase
      .from('leaderboard_cumulative')
      .select('total_score')
      .limit(10);
      
    // Fetch user's previous total score
    const { data: userPrev } = await supabase
      .from('leaderboard_cumulative')
      .select('total_score')
      .eq('username', username)
      .maybeSingle();
      
    const newTotalScore = (userPrev?.total_score || 0) + submissionScore;
    
    let isCumulativeRecord = false;
    if (!topCumulative || topCumulative.length < 10) {
      isCumulativeRecord = true;
    } else {
      const lowestTopScore = Math.min(...topCumulative.map(r => r.total_score));
      if (newTotalScore > lowestTopScore) {
        isCumulativeRecord = true;
      }
    }

    const isNewRecord = isSpeedRecord || isCumulativeRecord;

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
    return { isNewRecord };
  } catch (err) {
    console.error('Failed to submit to leaderboard:', err);
    return { isNewRecord: false };
  }
};
