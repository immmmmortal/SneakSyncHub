document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementsByClassName('search-bar-two');
    const submitIcon = document.querySelector('#search-icon-submit');

    const sendFormData = function () {
        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: formData
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
        });
    };

    submitIcon.addEventListener('click', function (sendFormData) {
        sendFormData();
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent the form from submitting the traditional way
        sendFormData();
    });

    
});

// document.addEventListener('DOMContentLoaded', function () {
//     const form = document.getElementsByClassName('search-bar-two');
//     const article_info = document.getElementsByClassName('article-info-section');

//     form.addEventListener('submit', function (event) {
//         event.preventDefault();  // Prevent the form from submitting the traditional way

//         const formData = new FormData(form);

//         fetch(form.action, {
//             method: 'POST',
//             headers: {
//                 'X-CSRFToken': formData.get('csrfmiddlewaretoken')
//             },
//             body: formData
//         })
//         .then(response => response.json())
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     });
// });