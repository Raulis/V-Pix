'use strict';

// Check webP support
// Code by https://davidwalsh.name/detect-webp
let format;
async function supportsWebp() {
    if (!self.createImageBitmap) return false;

    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = await fetch(webpData).then(r => r.blob());
    return createImageBitmap(blob).then(() => true, () => false);
}

(async () => {
    if (await supportsWebp()) {
        format = '.webp';
    } else {
        format = '.jpg';
    }
})();

// Globals
const container = document.querySelector('.content__sidebar-image-list');
const bigImageContainer = document.querySelector('.content__big-image');
let images = []; // array of all loaded images
const state = {
    page: 1, // image page
    limit: 5, // how many images per page
    firstLoad: false,
    newImages: [], // on new load images are saved here - temporary
    nextLoad: 200, // how many pixels should be scrolled to activate new load of images
    device: '' // mobile or desktop
};

if (!state.firstLoad) {
    // Load first images
    loadImages();

    // Change state
    state.firstLoad = true;

    // Check device
    if (window.innerWidth <= 1000) {
        state.device = 'mobile';
        state.nextLoad = 50;
    } else {
        state.device = 'desktop';
        state.nextLoad = 200
    }
}

function loadImages() {
    // Get array of images
    fetch(`https://picsum.photos/v2/list?page=${state.page}&limit=${state.limit}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        // Create small image list
        .then((data) => {
            // Add data to images array
            images = images.concat(data);

            // Set newly loaded images in temporary array
            state.newImages = state.newImages.concat(data);

            let smallImages = data
                .map(data => {
                    let image = `
                        <li>
                            <img class="loading content__image content__image--small" id="${data.id}" src="https://picsum.photos/id/${data.id}/200${format}" alt="If only this api had any alt for the images">
                        </li>
                    `;
                    return image;
                })
                .join('');

            // Add small images to front-end
            container.innerHTML += smallImages;

            // Update page state
            state.page = state.page + 1;
        })
        // Preload all new big images
        .then(() => {
            state.newImages.map(img => {
                const reg = new Image();
                reg.src = img.download_url + format;
            })

            // Reset new images array
            state.newImages = [];
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Function to load Big images in the right side
function loadBigImage(e) {
    if (e.target.nodeName == 'IMG') {
        // Get ID of selected image
        const selectedImageID = e.target.id;

        // Filter image data from loaded images by selected image ID
        const selectedImageData = images.filter(obj => {
            return obj.id === selectedImageID;
        });

        // Create new container for big image
        // TODO: Would be nice to set appropriate height and width for each image
        const bigImage = `
            <img class="content__image content__image--large" id="${selectedImageID}" src="${selectedImageData[0].download_url}${format}" alt="If only this api had any alt for the images">
        `;

        // Insert image to html
        bigImageContainer.innerHTML = `
            <div class="content__image-data">
                <h3 class="content__image-author">Author: ${selectedImageData[0].author}</h3>
                Width: ${selectedImageData[0].width} Height: ${selectedImageData[0].height}
            </div>
            ${bigImage}
        `;

    }
}

// Listen for clicks on samall images
container.addEventListener('click', loadBigImage, false);

// Check when to load new images
const sideBar = document.querySelector('.content__sidebar');

sideBar.addEventListener('scroll', () => {
    if (state.device == 'desktop') {
        // For desktop
        const height = sideBar.scrollTop;

        if (height >= state.nextLoad) {
            state.nextLoad += 1000;
            loadImages()
        }
        //console.log(height);
    } else {
        // For mobile
        const width = sideBar.scrollLeft;

        if (width >= state.nextLoad) {
            state.nextLoad += 500;
            loadImages()
        }
        //console.log(width);
    }
});