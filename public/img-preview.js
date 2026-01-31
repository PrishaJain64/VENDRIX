document.getElementById("thumbnail").addEventListener("change", function () {
    document.getElementById("preview").src =
      URL.createObjectURL(this.files[0]);
  });