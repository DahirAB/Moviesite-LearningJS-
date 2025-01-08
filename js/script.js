const state = {
	curPage: window.location.pathname,
	term: '',
	type: '',
	page: 1,
	totalPages: 1,
	totalRes: 0,
};

function showAlert(mes, className = 'error') {
	const alertel = document.createElement('div');
	alertel.classList.add('alert', className);
	alertel.appendChild(document.createTextNode(mes));
	document.querySelector('#alert').appendChild(alertel);

	setTimeout(() => alertel.remove(), 3000);
}
function showSpinner() {
	document.querySelector('.spinner').classList.add('show');
}
function hideSpinner() {
	document.querySelector('.spinner').classList.remove('show');
}
async function displaySwiper() {
	const { results: nowPlayingData } = await fetchTmbdData('movie/now_playing');

	nowPlayingData.forEach((movie) => {
		const div = document.createElement('div');
		div.classList.add('swiper-slide');
		const image = movie.poster_path
			? `https://image.tmdb.org/t/p/w400${movie.poster_path}`
			: './images/no-image.jpg';
		div.innerHTML = `
			<a href="movie-details.html?id=${movie.id}">
             	<img src="${image}" alt="${movie.title}" />
             </a>
            	<h4 class="swiper-rating">
              	  <i class="fas fa-star text-secondary"></i> ${movie.vote_average}/ 10
            		</h4>`;
		document.querySelector('.swiper-wrapper').appendChild(div);
	});
	initSwiper();
}
function initSwiper() {
	const swiper = new Swiper('.swiper', {
		slidesPerView: 1,
		spaceBetween: 30,
		loop: true,

		freeMode: true,
		autoplay: {
			delay: 3000,
			disableOnInteraction: false,
		},
		breakpoints: {
			500: {
				slidesPerView: 2,
			},
			700: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
		},
	});
}

async function search() {
	const queryString = window.location.search;
	qStrArr = queryString.split(/[=&]+/);

	state.type = qStrArr[1];
	state.term = qStrArr[3];
	if (state.term !== '') {
		const {
			results: searchData,
			total_pages,
			page,
			total_results,
		} = await searchApiData();
		state.totalPages = total_pages;
		state.page = page;
		state.totalRes = total_results;
		if (searchData.length === 0) {
			showAlert('Not found');
			return;
		}
		displaySearchRes(searchData);
		document.querySelector('#search-term').value = '';
	} else {
		showAlert('enter term');
	}
}
function displaySearchRes(data) {
	console.log(state.term, state.type, state.page);
	document.querySelector('#search-results').innerHTML = '';
	document.querySelector('#search-results-heading').innerHTML = '';
	document.querySelector('#pagination').innerHTML = '';

	data.forEach((dataObj) => {
		const div = document.createElement('div');
		div.classList.add('card');
		const title = state.type === 'movie' ? dataObj.title : dataObj.name;
		const release_date =
			state.type === 'movie' ? dataObj.release_date : dataObj.first_air_date;
		const image = dataObj.poster_path
			? `https://image.tmdb.org/t/p/w500/${dataObj.poster_path}`
			: `images/no-image.jpg`;
		div.innerHTML = `
        <a href="${state.type}-details.html?id=${dataObj.id}">
            <img
                src="${image}"
                class="card-img-top"
                alt="${title}"
            />
        </a>
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">
                <small class="text-muted">Release: ${release_date}</small>
            </p>
        </div>`;
		document.querySelector('#search-results-heading').innerHTML = `<h2>${
			data.length * state.page
		} of ${state.totalRes} Results of ${state.term.split('+').join('  ')}</h2>`;
		document.querySelector('#search-results').appendChild(div);
	});

	displayPagination();
}

function displayPagination() {
	const div = document.createElement('div');
	div.classList.add('pagination');
	div.innerHTML = `
	<button class="btn btn-primary" id="prev">Prev</button>
					<button class="btn btn-primary" id="next">Next</button>
					<div class="page-counter">Page ${state.page} of ${state.totalPages}</div>
					`;
	document.querySelector('#pagination').appendChild(div);
	if (state.page === 1) {
		document.querySelector('#prev').disabled = true;
	}
	if (state.page === state.totalPages) {
		document.querySelector('#next').disabled = true;
	}
	document.querySelector('#next').addEventListener('click', async () => {
		state.page++;
		const { results, total_pages } = await searchApiData();
		console.log(results);
		displaySearchRes(results);
	});
	document.querySelector('#prev').addEventListener('click', async () => {
		state.page--;
		const { results, total_pages } = await searchApiData();
		console.log(results);
		displaySearchRes(results);
	});
}
async function searchApiData() {
	showSpinner();
	const res = await fetch(
		`${API_URL}/search/${state.type}?api_key=${API_KEY}&query=${state.term}&page=${state.page}`
	);
	const data = await res.json();
	hideSpinner();
	return data;
}
// function initSwiper() {
// 	const swiper = new Swiper('.swiper', {
// 		slidesPerView: 1,
// 		spaceBetween: 30,
// 		loop: true,
// 		effect: 'fade', // Use fade effect only for single slide view
// 		fadeEffect: {
// 			crossFade: true,
// 		},
// 		autoplay: {
// 			delay: 300,
// 			disableOnInteraction: false,
// 		},
// 		breakpoints: {
// 			500: {
// 				slidesPerView: 2, // Multiple slides for this breakpoint
// 				effect: 'slide', // Override fade effect
// 				spaceBetween: 20,
// 				autoplay: {
// 					delay: 300,
// 					disableOnInteraction: false,
// 				},
// 			},
// 			700: {
// 				slidesPerView: 3,
// 				effect: 'slide',
// 				spaceBetween: 20,
// 				autoplay: {
// 					delay: 300,
// 					disableOnInteraction: false,
// 				},
// 			},
// 			1200: {
// 				slidesPerView: 4,
// 				effect: 'slide',
// 				spaceBetween: 30,
// 				autoplay: {
// 					delay: 300,
// 					disableOnInteraction: false,
// 				},
// 			},
// 		},
// 	});
// }
async function displayTvShows() {
	const { results: popTvShowData } = await fetchTmbdData('tv/top_rated');
	const popTvShowGrid = document.querySelector('#popular-shows');
	for (const popTvShowObj of popTvShowData) {
		const seasonData = await fetchTmbdData(`tv/${popTvShowObj.id}`);

		const div = document.createElement('div');
		div.classList.add('card');
		const image = popTvShowObj.poster_path
			? `https://image.tmdb.org/t/p/w500${popTvShowObj.poster_path}`
			: `images/no-image.jpg`;

		div.innerHTML = `
        <a href="tv-details.html?id=${popTvShowObj.id}">
            <img
                src="${image}"
                    class="card-img-top"
                    alt="${popTvShowObj.name}"
            />
        </a>
        <div class="card-body">
            <h5 class="card-title">${popTvShowObj.name}</h5>
            <p class="card-text">
                    <small class="text-muted">Aired: ${popTvShowObj.first_air_date}</small>
            </p>
            <p class="card-text">
                    <small class="text-muted">Season Count: ${seasonData.last_episode_to_air.season_number}</small>
            </p>
        </div>
        `;

		popTvShowGrid.appendChild(div);
	}
}
async function displayPopMovies() {
	const { results: popMovieData } = await fetchTmbdData('movie/popular');
	const popMovieGrid = document.querySelector('#popular-movies');
	popMovieData.forEach((popMovieObj) => {
		const div = document.createElement('div');
		popMovieGrid.appendChild(div);
		div.classList.add('card');
		const image = popMovieObj.poster_path
			? `https://image.tmdb.org/t/p/w500${popMovieObj.poster_path}`
			: `images/no-image.jpg`;
		div.innerHTML = `
        <a href="movie-details.html?id=${popMovieObj.id}">
            <img
                src="${image}"
                class="card-img-top"
                alt="${popMovieObj.title}"
            />
        </a>
        <div class="card-body">
            <h5 class="card-title">${popMovieObj.title}</h5>
            <p class="card-text">
                <small class="text-muted">Release: ${popMovieObj.release_date}</small>
            </p>
        </div>`;
	});
}
function displayBackdrop(type, path) {
	const overlaydiv = document.createElement('div');
	overlaydiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${path})`;

	overlaydiv.style.backgroundSize = 'cover';
	overlaydiv.style.backgroundPosition = 'center';
	overlaydiv.style.backgroundRepeat = 'no-repeat';
	overlaydiv.style.height = '100vh';
	overlaydiv.style.width = '100vw';
	overlaydiv.style.position = 'absolute';
	overlaydiv.style.left = '0';
	overlaydiv.style.top = '0';
	overlaydiv.style.zIndex = '-1';
	overlaydiv.style.opacity = '0.1';

	if (type === 'movie') {
		document.querySelector('#movie-details').appendChild(overlaydiv);
	} else {
		document.querySelector('#show-details').appendChild(overlaydiv);
	}
}
async function displayMovieDetail() {
	const movieId = window.location.search.split('=')[1];
	const movie = await fetchTmbdData(`movie/${movieId}`);

	displayBackdrop('movie', movie.backdrop_path);
	const div = document.createElement('div');
	const image = movie.poster_path
		? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
		: `images/no-image.jpg`;
	div.innerHTML = `
        <div class="details-top">
            <div>
                <img
                    src="${image}"
                    class="card-img-top"
                    alt="Movie Title"
                />
            </div>
        
            <div>
                <h2>${movie.title}</h2>
                <p>
                    <i class="fas fa-star text-primary"></i>
                    ${movie.vote_average.toFixed(1)}/10
                </p>
                <p class="text-muted">Release Date: ${movie.release_date}</p>
                <p>
                    ${movie.overview}
                </p>
                <h5>Genres</h5>
                <ul class="list-group">
                                    ${movie.genres
																			.map((genre) => `<li>${genre.name}</li>`)
																			.join('')}
                </ul>
                <a href="${
									movie.homepage
								}" target="_blank" class="btn">Visit Movie Homepage</a>
        </div>
        </div>
        <div class="details-bottom">
            <h2>Movie Info</h2>
            <ul>
                <li><span class="text-secondary">Budget:</span> $${movie.budget.toLocaleString()}</li>
                <li><span class="text-secondary">Revenue:</span>$${movie.revenue.toLocaleString()}</li>
                <li><span class="text-secondary">Runtime:</span> ${
									movie.runtime
								} minutes</li>
                <li><span class="text-secondary">Status:</span> ${
									movie.status
								}</li>
            </ul>
            <h4>Production Companies</h4>
            <ul class="list-group">${movie.production_companies
							.map((company) => `<li>${company.name}</li>`)
							.join('')}
            </ul>
        </div>
        `;
	document.querySelector('#movie-details').appendChild(div);
}
async function displayTVShowDetail() {
	const tvId = window.location.search.split('=')[1];
	const tvShow = await fetchTmbdData(`tv/${tvId}`);

	displayBackdrop('Show', tvShow.backdrop_path);
	const div = document.createElement('div');
	const image = tvShow.poster_path
		? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
		: `images/no-image.jpg`;
	div.innerHTML = `
	<div class="details-top">
        <div>
            <img
            src="${image}"
            class="card-img-top"
            alt="${tvShow.name}"
            />
        </div>
        <div>
            <h2>${tvShow.name}</h2>
            <p>
            <i class="fas fa-star text-primary"></i>
            ${tvShow.vote_average.toFixed(1)}/ 10
            </p>
            <p class="text-muted">Release Date: ${tvShow.first_air_date}</p>
            <p> 
			${tvShow.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
        	${tvShow.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
            </ul>
            <a href="${
							tvShow.homepage
						}" target="_blank" class="btn">Visit Show Homepage</a>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Show Info</h2>
        <ul>
			<li><span class="text-secondary">Number Of Episodes:</span> ${
				tvShow.number_of_episodes
			}</li>
            <li>
            <span class="text-secondary">Last Episode To Air:</span>  ${
							tvShow.last_episode_to_air.name
						}
            </li>
            <li><span class="text-secondary">Status:</span> ${
							tvShow.status
						} Released</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">${tvShow.production_companies
					.map((company) => `<span>${company.name}</span>    `)
					.join('')}</div>
    </div>
	`;
	document.querySelector('#show-details').appendChild(div);
}
async function fetchTmbdData(endpoint) {
	showSpinner();
	const res = await fetch(`${API_URL}/${endpoint}?api_key=${API_KEY}`);
	const data = await res.json();
	hideSpinner();
	return data;
}

function HighlightActiveLink() {
	const navLinks = document.querySelectorAll('.nav-link');
	navLinks.forEach((link) => {
		if (link.getAttribute('href') === state.curPage) {
			link.classList.add('active');
		}
	});
}

function init() {
	//simple router
	switch (state.curPage) {
		case '/':
		case '/index.html':
			displaySwiper();
			displayPopMovies();
			break;
		case '/shows.html':
			displayTvShows();
			break;
		case '/movie-details.html':
			displayMovieDetail();
			break;
		case '/tv-details.html':
			displayTVShowDetail();
			break;
		case '/search.html':
			search();
			break;
	}
	HighlightActiveLink();
}

init();
