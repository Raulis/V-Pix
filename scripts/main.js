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
let images;

// Get array of images
fetch('https://picsum.photos/v2/list')
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    // Create small image list
    .then((data) => {
        images = data;
        let smallImages = images
            .map(images => {
                let image = `
                        <li>
                            <img class="loading content__image content__image--small" id="${images.id}" src="https://picsum.photos/id/${images.id}/200${format}" alt="If only this api had any alt for the images">
                        </li>
                    `;
                return image;
            })
            .join('');
        container.innerHTML += smallImages;
    })
    // Preload all big images
    .then(() => {
        images.map(img => {
            const reg = new Image();
            reg.src = img.download_url + format;
        })
    })
    .catch((error) => {
        console.error('Error:', error);
    });

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