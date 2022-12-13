import './css/styles.css';
//imports
import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import SmoothScroll from 'smoothscroll-for-websites';

const searchForm = document.querySelector('form#search-form');
const inputSearch = document.querySelector("input[name='searchQuery']");
const gallery = document.querySelector('div.gallery');
const moreBtn = document.querySelector('.load-more');
const backBtn = document.querySelector('.go-back');
let perPage = 40;
let page = 0;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
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

  console.log('inputSearchValue:', inputSearchValue);
  if (inputSearchValue.length < 1) {
    // moreBtn.style.display = 'none';
    // backBtn.style.display = 'none';

    Notiflix.Notify.warning('Please enter what you want to search for!');
  } else {
    window.addEventListener('scroll', handleInfiniteScroll);
    backBtn.style.display = 'block';
    fetchPictures(inputSearchValue, page)
      .then(responseData => {
        let picsInArray = responseData.hits.length;

        const totalPages = Math.ceil(responseData.totalHits / perPage);
        console.log('totalPages:', totalPages);
        if (picsInArray === 0) {
          Notiflix.Notify.warning(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          galleryBuild(responseData);
          lightbox.refresh();
          Notiflix.Notify.success(
            `Hooray! We found ${responseData.totalHits} images.`
          );
          console.log('page:', page);
        }
      })
      .catch(error => console.log(error));
  }
}
//loading more content
const loadMore = () => {
  //   moreBtn.style.display = 'none';
  //   backBtn.style.display = 'none';
  let inputSearchValue = inputSearch.value;
  page += 1;

  fetchPictures(inputSearchValue, page)
    .then(responseData => {
      galleryBuild(responseData);
      lightbox.refresh();
      //   moreBtn.style.display = 'block';
      //   backBtn.style.display = 'block';
      const totalPages = Math.ceil(responseData.totalHits / perPage);
      let picsInArray = responseData.hits.length;

      if (picsInArray > 0) {
        galleryBuild(responseData);
        lightbox.refresh();
        // moreBtn.style.display = 'block';
        // backBtn.style.display = 'block';
        console.log('page:', page);
        console.log('picsInArray', picsInArray);

        if (page === totalPages) {
          galleryBuild(responseData);
          lightbox.refresh();
          console.log('No more pages');
          removeInfiniteScroll();
          console.log('picsInArray', picsInArray);
          //   moreBtn.style.display = 'none';
          backBtn.style.display = 'block';
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

searchForm.addEventListener('submit', showPictures);
moreBtn.addEventListener('click', loadMore);

moreBtn.style.display = 'none';
backBtn.style.display = 'none';
//Pixabay API
const API_KEY = '32017206-7eec6bebfecae194d1479b789';
//html build
const galleryBuild = responseData => {
  const markup = responseData.hits
    .map(
      hit =>
        `<div class="photo-card gallery__item">
        <a class="gallery__link" href=${hit.largeImageURL}>
      <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <div class="info">
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
      </div>
      </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  
};

//go back function
const goBack = () => {
  let inputSearchValue = inputSearch.value;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
};
backBtn.addEventListener('click', goBack);
//
//infinitescroll remove
const removeInfiniteScroll = () => {
  window.removeEventListener('scroll', handleInfiniteScroll);
};
//infinite scroll
const handleInfiniteScroll = () => {
  throttle(() => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

    if (endOfPage) {
      loadMore();
    }
  }, 1000);
};
//
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
//

//commented all buttons activities for infinitescroll to work properly

//smooth scroll
SmoothScroll({ stepSize: 40 });
