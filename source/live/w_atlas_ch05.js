import { Live } from './core.js';
import { mountAtlas } from './atlas/adapters/kym-live.js';
import { CHAPTER } from './atlas/physics/ch05-universal-gravitation/chapter.js';

Live.register('atlas_ch05', (stage, params, api) => mountAtlas(stage, params, api, CHAPTER, {
  page: params?.page ?? 0,
  height: 410,
}), {
  three: true,
});
