/* Global Flickity */
import {templates, classNames, select} from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }
}

