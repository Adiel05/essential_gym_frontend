import { Howl } from 'howler';

export const useSound = (src, volume = 0.2) => {
  const sound = new Howl({
    src: [src],
    volume: volume,
    preload: true,
  });

  const play = () => sound.play();
  return play;
};