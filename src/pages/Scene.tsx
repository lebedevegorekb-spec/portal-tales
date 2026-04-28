import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useRealtimeVotes } from '../hooks/useRealtimeVotes';
import VoteButton from '../components/VoteButton';
import { Loader } from '../components/Loader';

export default function Scene() {
  const { runId } = useParams();
  const [scene, setScene] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  
  const votes = useRealtimeVotes(runId || '', scene?.id || '');

  useEffect(() => {
    loadScene();
    loadUser();
  }, [runId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || '');
  };

  const loadScene = async () => {
    try {
      const { data, error } = await supabase
        .from('runs')
        .select('state_json')
        .eq('id', runId);

      console.log('Run data:', data);

      if (error) {
        console.error('Error loading scene:', error);
      } else if (data && data.length > 0 && data[0]?.state_json?.current_scene) {
        setScene(data[0].state_json.current_scene);
      }
    } catch (error) {
      console.error('Error loading scene:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!scene) return <div className="text-white text-center mt-10">Сцена не найдена</div>;

  const votedCount = votes.length;
  const hasVoted = votes.some(v => v.player_id === userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{scene.title}</h1>
        <p className="text-lg mb-6">{scene.description}</p>
        
        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm">Проголосовало: {votedCount}</p>
        </div>

        <div className="space-y-3">
          {scene.options?.map((option: any) => (
            <VoteButton
              key={option.id}
              runId={runId!}
              sceneId={scene.id}
              optionId={option.id}
              optionText={option.text}
              disabled={hasVoted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
