import { Popup } from "./popups.js";

export class PopupImage extends Popup {
    constructor(className) {
     super(className);
    }
    open(data) {
      const imagePopup = this.popup.querySelector('.popup__image');
      imagePopup.src = data.image;
      super.open()
    }
  }
