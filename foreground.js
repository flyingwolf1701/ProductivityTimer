const ce_main_container = document.createElement('div');
const ce_name = document.createElement('div');
const ce_input = document.createElement('input');
const ce_button = document.createElement('div');

ce_main_container.classList.add('ce_main');
ce_name.id = 'ce_name';
ce_input.id = 'ce_input';
ce_button.id = 'ce_button';

ce_name.innerHTML = 'Hello NAME';
ce_button.innerHTML = 'Change Name';

ce_main_container.appendChild(ce_name);
ce_main_container.appendChild(ce_input);
ce_main_container.appendChild(ce_button);

document.querySelector('body').appendChild(ce_main_container);



// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.message === 'change_name') {
//         ce_name.innerHTML = `Hello ${request.payload}`;
//     }
// });