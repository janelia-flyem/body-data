n_galleryTransformations = {
  tooglexy(checked) {
    if (checked) {
      $('input[data-view=xy]').each = function () {
        this.checked = true;
      };
    } else {
      $('input[data-view=xy]').each = function () {
        this.checked = false;
      };
    }
  },
};
