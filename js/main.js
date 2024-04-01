document.addEventListener('DOMContentLoaded', function(){

	// fetch('/test.json', {
	// 	method: 'post',
	// 	credentials: 'include'
	// }).then(response => {
	// 	return response.json();
	// }).then(resp => {
	// 	console.log(resp);
	// });

	const header = document.querySelector('.h'),
				burgerBtn = document.querySelector('.burger');

	const stickFunc = () => {

		if (window.scrollY > 0) {
			header.classList.add('h--scrolled');
		} else {
			header.classList.remove('h--scrolled');
		}
	}

	window.addEventListener('scroll', () => {
		requestAnimationFrame(stickFunc)
	});
});