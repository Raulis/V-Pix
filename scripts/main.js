'use strict';

const container = document.querySelector('.content-sidebar__image-list');
const bigImageContainer = document.querySelector('.content-main');
let images;

(function () {
    fetch('https://picsum.photos/v2/list')
        .then(function (resp) {
            return resp.json();
        })
        .then(function (data) {
            images = data;
            let smallImages = data
                .map(data => {
                    let image = `
                        <li>
                            <img class="content__image content__image--small" id="${data.id}" src="https://picsum.photos/id/${data.id}/200" alt="If only this api had any alt for the images">
                        </li>
                    `;
                    return image;
                })
                .join('');
            container.innerHTML = smallImages;
        });
})();

function loadBigImage(e) {
    //TODO: galbut geriau butu sukurti nauja img taga jei keisti esama?
    if (e.target.nodeName == 'IMG') {
        // Clone node of selected image and get id
        const selectedImage = e.target.cloneNode(true);
        const selectedImageID = selectedImage.id;

        // Filter image data from loaded images by selected image id
        const selectedImageData = images.filter(obj => {
            return obj.id === selectedImageID;
        });

        // Remove and add appropriate classes
        selectedImage.classList.remove("content__image--small");
        selectedImage.classList.add("content__image--large");

        // Edit image src
        selectedImage.src = selectedImageData[0].download_url;

        // Insert image to container
        bigImageContainer.innerHTML = `
            <div class="content__image-data">
                <h3 class="content__image-author">Author: ${selectedImageData[0].author}</h3>
                Width: ${selectedImageData[0].width} Height: ${selectedImageData[0].height}
            </div>
            ${selectedImage.outerHTML}
        `;

    }

}

container.addEventListener('click', loadBigImage, false);