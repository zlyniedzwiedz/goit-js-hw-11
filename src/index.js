import './css/styles.css';
//imports
import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SmoothScroll from 'smoothscroll-for-websites';
const debounce = require('lodash.debounce');

const searchForm = document.querySelector('form#search-form');
const inputSearch = document.querySelector("input[name='searchQuery']");
const gallery = document.querySelector('div.gallery');
const moreBtn = document.querySelector('.load-more');
const backBtn = document.querySelector('.go-back');
const settingsBtn = document.querySelector('.moreSetting');

let perPage = 40;
let page = 0;
let totalPages = 0;
let buttonState = false;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

inputSearch.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
});


//data fetch
async function fetchPictures(inputSearchValue, page) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${inputSearchValue}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.log('fetch error:', error.message);
  }
}
//displaying content
async function showPictures(event) {
  event.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  let inputSearchValue = inputSearch.value;
  if (inputSearchValue === '') {
    preventDefault();
    page = 0;
    totalPages = 0;
    moreBtn.classList.add('is-hidden');
    return;
  }

  if (inputSearchValue.length < 1) {
    Notiflix.Notify.warning('Please enter what you want to search for!');
  } else {
    fetchPictures(inputSearchValue, page)
      .then(responseData => {
        let picsInArray = responseData.hits.length;

        totalPages = Math.ceil(responseData.totalHits / perPage);
        if (picsInArray === 0) {
          Notiflix.Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          moreBtn.classList.add('is-hidden');
          page = 0;
          totalPages = 0;
        } else {
          galleryBuild(responseData);
          lightbox.refresh();
          settingsCheck();
          console.log(`Page: ${page} z ${totalPages}`);
          Notiflix.Notify.success(
            `Hooray! We found ${responseData.totalHits} images.`
          );
        }
        if (page === totalPages) {
          moreBtn.classList.add('is-hidden');
        }
      })
      .catch(error => console.log(error));
  }
}

//loading more content
const loadMore = () => {
  let inputSearchValue = inputSearch.value;
  if (inputSearchValue === '') {
    return;
  }
  page += 1;

  fetchPictures(inputSearchValue, page)
    .then(responseData => {
      // totalPages = Math.ceil(responseData.totalHits / perPage);
      let picsInArray = responseData.hits.length;

      if (picsInArray > 0) {
        galleryBuild(responseData);
        lightbox.refresh();
        if (buttonState === false) {
          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2.75,
            behavior: 'smooth',
          });
        } else {
          const { height: cardHeight } = document
            .querySelector('.gallery')
            .firstElementChild.getBoundingClientRect();
          window.scrollBy({
            top: cardHeight * 2.5,
            behavior: 'smooth',
          });
        }

        console.log(`Page: ${page} z ${totalPages}`);
        if (page === totalPages) {
          console.log('No more pages');
          removeInfiniteScroll();

          moreBtn.classList.add('is-hidden');

          Notiflix.Notify.warning(
            "We're sorry, but you've reached the end of search results."
          );
        }
      }
      if (picsInArray == 0) {
        removeInfiniteScroll();
      }
      return;
    })
    .catch(error => console.log(error));
};

searchForm.addEventListener('input', debounce(showPictures, 500));
moreBtn.addEventListener('click', loadMore);

//Pixabay API
const API_KEY = '32017206-7eec6bebfecae194d1479b789';

//html build
const galleryBuild = responseData => {
  const markup = responseData.hits
    .map(
      hit =>
        `<div class="photo-card gallery__item">
        <figure>
        <a class="gallery__link" href=${hit.largeImageURL}>
      <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <figcaption class="info">
      <p class="info-item">
      <b>Likes</b> ${hit.likes}
      </p>
      <p class="info-item">
      <b>Views</b> ${hit.views}
      </p>
      <p class="info-item">
      <b>Comments</b> ${hit.comments}
      </p>
      <p class="info-item">
      <b>Downloads</b> ${hit.downloads}
      </p>
      </figcaption>
      </figure>
      </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
};

//go back function
const goBack = event => {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
backBtn.addEventListener('click', goBack);

//infinitescroll remove
const removeInfiniteScroll = () => {
  window.removeEventListener('scroll', handleInfiniteScroll);
};

//infinite scroll
const handleInfiniteScroll = () => {
  throttle(() => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;
    if (page != totalPages) {
      if (endOfPage) {
        loadMore();
      }
    }
  }, 1000);
};
window.addEventListener('scroll', handleInfiniteScroll);
//throttle
let throttleTimer;

const throttle = (callback, time) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

//smooth scroll
SmoothScroll({ stepSize: 40 });

//back to top
window.onscroll = () => {
  backToTop();
};
function backToTop() {
  if (
    document.body.scrollTop > 150 ||
    document.documentElement.scrollTop > 150
  ) {
    backBtn.style.display = 'block';
  } else {
    backBtn.style.display = 'none';
  }
}
const settingsCheck = () => {
  if (buttonState === false) {
    moreBtn.classList.add('is-hidden');
    handleInfiniteScroll();
  }
  if (buttonState === true) {
    if (page != totalPages) {
      moreBtn.classList.remove('is-hidden');
      removeInfiniteScroll();
    }
  }
};
const settingsSwitch = () => {
  buttonState = !buttonState;
  settingsBtn.innerHTML = buttonState
    ? 'Current loading mode: More Button'
    : 'Current loading mode: Scrolling';
  settingsCheck();
};

settingsBtn.addEventListener('click', settingsSwitch);
