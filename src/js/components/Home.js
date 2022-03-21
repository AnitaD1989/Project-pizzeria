/* Global Flickity */
import {templates, classNames, select} from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.widgets.carousel);
  }
}

