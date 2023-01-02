import { setDataRefresh } from './utils.js';
import { api } from './api.js';
import { Card } from './card.js';
import { Popup } from './popups.js';
import { CatsInfo } from './cats-info.js';
import { cats } from './cats.js';
import { PopupImage } from './popups-image.js';

const cardsContainer = document.querySelector('.cards');
const btnOpenPopupForm = document.querySelector('#add');
const btnOpenPopupLogin = document.querySelector('#login');

const formCatAdd = document.querySelector('#popup-form-cat');
const formLogin = document.querySelector('#popup-form-login');

const popupAddCat = new Popup('popup-add-cats');
popupAddCat.setEventListener();

const popupLogin = new Popup('popup-login');
popupLogin.setEventListener();

const popupCatInfo = new Popup('popup-cat-info');
popupCatInfo.setEventListener();

const popupImage = new PopupImage('popup-image');
popupImage.setEventListener();

const catsInfoInstance = new CatsInfo(
  '#cats-info-template',
  handleEditCatInfo,
  handleLike,
  handleCatDelete
)

const catsInfoElement = catsInfoInstance.getElement()

function serializeForm(elements) {
  const formData = {};

  elements.forEach((input) => {
    if (input.type === 'submit') return;

    if (input.type !== 'checkbox') {
      formData[input.name] = input.value;
    }
    if (input.type === 'checkbox') {
      formData[input.name] = input.checked;
    }
  });

  return formData;
}

function createCat(dataCat) {
  const cardInstance = new Card(dataCat, 
    '#card-template', 
    handleCatTitle,
    handleCatImage, 
    handleLike
    );
  const newCardElement = cardInstance.getElement();
  cardsContainer.append(newCardElement);
}

function handleFormAddCat(e) {
  e.preventDefault();
  const elementsFormCat = [...formCatAdd.elements];

  const dataFromForm = serializeForm(elementsFormCat);

  api.addNewCat(dataFromForm).then(() => {
    console.log({ dataFromForm });
    console.log(elementsFormCat);
    createCat(dataFromForm);
    updateLocalStorage(dataFromForm, { type: 'ADD_CAT' });
  });
  // const oldStorage = JSON.parse(localStorage.getItem('cats'));
  // oldStorage.push(dataFromForm);
  // localStorage.setItem('cats', JSON.stringify(oldStorage));
  popupAddCat.close();
}

function handleFormLogin(e) {
  e.preventDefault();
  const elementsFormCat = [...formLogin.elements];
  const dataFromForm = serializeForm(elementsFormCat);
  // console.log(dataFromForm);
  Cookies.set('email', `email=${dataFromForm.email}`);
  btnOpenPopupLogin.classList.add('visually-hidden');

  Cookies.set('password', `password=${dataFromForm.password}`);
  btnOpenPopupLogin.classList.add('visually-hidden');
  popupLogin.close();

  

}

function handleCatTitle(cardInstance) {
  catsInfoInstance.setData(cardInstance)
  popupCatInfo.setContent(catsInfoElement);
  popupCatInfo.open()
}

function handleCatImage(dataCard) {
  popupImage.open(dataCard)
}

function handleLike(data, cardInstance) {
  const {id, favorite} = data;
  api.updateCatById(id, {favorite})
  .then(() => {
    if(cardInstance){
      cardInstance.setData(data);
    cardInstance.updateView();
    }
    
    updateLocalStorage(data, {type: 'EDIT_CAT'});
    
  })
}

function handleCatDelete(cardInstance) {
  api.deleteCatById(cardInstance.getId()).then(() => {
      cardInstance.deletView();
      updateLocalStorage(cardInstance.getData(), {type: 'DELETE_CAT'});
      popupCatInfo.close();
    })
}

function handleEditCatInfo(cardInstance, data) {
  const {age, description, name, id, image} = data;
  api.updateCatById(id, {age, description, name, image})
  .then(() => {
    cardInstance.setData(data);
    cardInstance.updateView();
    updateLocalStorage(data, {type: 'EDIT_CAT'})
    popupCatInfo.close();
  })
}
// document.cookie = 'Luke=IamYourFather2;samesite=strict;expires=60';
// document.cookie = 'email=email@email.com';

// Cookies.set('vasya', 'good');

// Cookies.set('potato', 'interest', { expires: 7 });

// // console.log(document.cookie);
// console.log(Cookies.get('potato'));

const isAuth = Cookies.get('email');
const password = Cookies.get('password');

const login = document.querySelector('.login');

if (!isAuth) {
  popupLogin.open();
  btnOpenPopupLogin.classList.remove('visually-hidden');
} else {
  login.remove('login');
}



// if (isAuth) {
//   btnOpenPopupLogin.classList.remove('visually-hidden');
// }

// btnOpenPopupLogin.classList.remove('visually-hidden');

// localStorage.setItem('Boromur', JSON.stringify({ name: 'Artur', lang: 'ad' }));
// // localStorage.getItem('Boromur');
// console.log(JSON.parse(localStorage.getItem('Boromur')));

// sessionStorage.setItem('name', 'value');
// localStorage.setItem('cats', JSON.stringify(cats));

function checkLocalStorage() {
  const localData = JSON.parse(localStorage.getItem('cats'));
  const getTimeExpires = localStorage.getItem('catsRefresh');

  const isActual = new Date() < new Date(getTimeExpires);

  if (localData && localData.length && isActual) {
    localData.forEach(function (catData) {
      createCat(catData);
    });
  } else {
    api.getAllCats().then((data) => {
      data.forEach(function (catData) {
        createCat(catData);
      });
      updateLocalStorage(data, { type: 'ALL_CATS' });
    });
  }
}

checkLocalStorage();

function updateLocalStorage(data, action) {
  const oldStorage = JSON.parse(localStorage.getItem('cats'));
  // {type: "ADD_CAT"} {type: "ALL_CATS"}  {type: "DELETE_CAT"}
  switch (action.type) {
    case 'ADD_CAT':
      localStorage.setItem('cats', JSON.stringify([...oldStorage, data]));
      return;
    case 'ALL_CATS':
      localStorage.setItem('cats', JSON.stringify(data));
      setDataRefresh(600, 'catsRefresh');
      return;
    case 'DELETE_CAT':
      const newStorage = oldStorage.filter((cat) => cat.id !== data.id);
      localStorage.setItem('cats', JSON.stringify(newStorage));
      return;
    case 'EDIT_CAT':
      const updatedLocalStorage = oldStorage.map((cat) =>
        cat.id === data.id ? data : cat
      );
      localStorage.setItem('cats', JSON.stringify(updatedLocalStorage));
      return;
    default:
      break;
  }
}

btnOpenPopupForm.addEventListener('click', () => {
  popupAddCat.open();
});
btnOpenPopupLogin.addEventListener('click', () => popupLogin.open());

formCatAdd.addEventListener('submit', handleFormAddCat);
formLogin.addEventListener('submit', handleFormLogin);

