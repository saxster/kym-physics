// Additional, source-grounded experiments; original chapter demonstrations remain available.
import {Live} from './core.js';
import {makeLab} from './lab_kit.js';
import lessons from '../lessons/waves.json';
import {mountThermal} from './waves_thermal.js';
import {mountMotion} from './waves_motion.js';
import {mountOptics} from './waves_optics.js';
import {mountColour} from './waves_colour.js';
Live.register('waveslab',(stage,params,api)=>{
 const entry=lessons.find(l=>l.id===params.lesson);
 if(!entry)throw new Error(`Unknown waves lesson: ${params.lesson}`);
 const lab=makeLab(stage,api,entry);
 const mount=entry.id.startsWith('w8-')?mountThermal:entry.id.startsWith('w9-')?mountMotion:entry.id.startsWith('w10-')?mountOptics:mountColour;
 mount(lab,api,entry.id,params.story,entry.storyPresets?.[params.story] || {});
 return {destroy(){}};
},{label:'Explore the mechanism',three:true});
