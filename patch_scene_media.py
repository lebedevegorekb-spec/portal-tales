with open('src/pages/Scene.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить импорты
old_import = 'import type { PartyGameConfig, RoundConfig } from "@/mechanics/types";'
new_import = '''import type { PartyGameConfig, RoundConfig } from "@/mechanics/types";
import { MediaPlayer } from "@/components/MediaPlayer";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";
import { BackgroundImage } from "@/components/BackgroundImage";'''
content = content.replace(old_import, new_import)

# Добавить state для медиа после useState loading
old_state = '  const [loading, setLoading] = useState(true);'
new_state = '''  const [loading, setLoading] = useState(true);
  const [replicaQueue, setReplicaQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);
  const [currentReplica, setCurrentReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);'''
content = content.replace(old_state, new_state)

# Добавить функцию показа реплик после хуков
old_hooks = '  // Загрузить данные комнаты и сценария'
new_hooks = '''  // Показать очередь реплик
  const showReplicas = (replicas: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>) => {
    setReplicaQueue(replicas);
    if (replicas.length > 0) setCurrentReplica(replicas[0]);
  };

  const onReplicaFinished = () => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      return next;
    });
  };

  // Загрузить данные комнаты и сценария'''
content = content.replace(old_hooks, new_hooks)

# Добавить медиа в рендер — перед RoundRouter
old_render = '      {/* Раунд */}\n      <RoundRouter'
new_render = '''      <BackgroundImage imagePath={currentRound?.background_image} />
      <MediaPlayer musicPath={currentRound?.background_music} />
      {currentReplica && (
        <ReplicaPlayer
          speaker={currentReplica.speaker}
          text={currentReplica.text}
          audioPath={currentReplica.audioPath}
          onFinished={onReplicaFinished}
        />
      )}

      {/* Раунд */}
      <RoundRouter'''
content = content.replace(old_render, new_render)

with open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
