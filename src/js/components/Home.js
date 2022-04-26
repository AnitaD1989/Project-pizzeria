/* Global Flickity */
import Flickity from 'flickity';
import {templates, classNames, select} from '../settings.js';

class Home {
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
    thisHome.initLinks();
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
    const thisHome = this;

    const element = document.querySelector(select.widgets.carousel);
    thisHome.carousel = new Flickity (element, {
      //options
      cellAlign: 'left',
      autoPlay: true,
      imagesLoaded: true,
    });
  }

  activatePage(pageId){
    const thisHome = this;

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);

    for(let page of thisHome.pages){

      if(page.id == pageId){
        page.classList.add(classNames.pages.active);
      
      } else {
        page.classList.remove(classNames.pages.active);
      }
    }

    for(let link of thisHome.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  }

  initLinks(){
    const thisHome = this;

    thisHome.boxLinks = document.querySelectorAll('.home-link');

    for(let link of thisHome.boxLinks){
      link.addEventListener('click', function(event){
        event.preventDefault();

        const clickedLink = this;

        const id = clickedLink.getAttribute('href').replace('#', '');

        thisHome.activatePage(id);
      });
    }
  }

  resizeCarousel(){
    const thisHome = this;

    thisHome.carousel.resize();
  }
}

export default Home;