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

  initWidgets(){
    const element = document.querySelector(select.widgets.carousel);

    new Flickity (element,{
      //options
      autoPlay: 3000,
      prevNextButtons: false,
      imagesLoaded: true,
    });
  }

  activatePage(pageId){
    const thisHome = this;

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);
  }
}

export default Home;