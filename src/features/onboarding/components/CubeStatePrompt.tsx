import { Modal } from '@/shared/components/Modal';
import { cubePrompt } from '@/content/onboarding/onboarding';
import { useCubeStore } from '@/app/store/cubeStore';

/** Ask whether the physical cube is scrambled (scan) or solved (provide scramble). */
export function CubeStatePrompt() {
  const setAppPhase = useCubeStore((state) => state.setAppPhase);

  return (
    <Modal
      open
      presentation="page"
      title={cubePrompt.title}
      body={cubePrompt.body}
      actions={[
        {
          label: cubePrompt.scrambled,
          onClick: () => setAppPhase('scanning'),
          variant: 'primary',
          autoFocus: true,
        },
        {
          label: cubePrompt.solved,
          onClick: () => setAppPhase('scrambleSetup'),
          variant: 'secondary',
        },
      ]}
    />
  );
}
