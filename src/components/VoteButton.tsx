import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface VoteButtonProps {
  runId: string;
  sceneId: string;
  optionId: string;
  optionText: string;
  disabled?: boolean;
}

export default function VoteButton({ runId, sceneId, optionId, optionText, disabled }: VoteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('player_id');
    if (!id) {
      id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('player_id', id);
    }
    setPlayerId(id);
  }, []);

  const handleVote = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          run_id: runId,
          player_id: playerId,
          scene_id: sceneId,
          option_id: optionId,
        });

      if (error) throw error;
      
      toast.success('Голос принят!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка голосования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={disabled || loading || !playerId}
      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
    >
      {loading ? 'Отправка...' : optionText}
    </button>
  );
}
