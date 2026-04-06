document.addEventListener("DOMContentLoaded", function () {

 document.querySelectorAll(".btn.primary").forEach(btn => {
  const originalText = btn.textContent; // save original text

  btn.onclick = () => {
    if (btn.textContent === originalText) {
      btn.textContent = "Approved";
    } else {
      btn.textContent = originalText;
    }
  };
});


document.querySelectorAll(".btn.outline").forEach(btn => {
  const originalText = btn.textContent;
  btn.onclick = () => {
    if (btn.textContent === originalText) {
      btn.textContent = "Block";
    } else {
      btn.textContent = originalText;
    }
  };
});
  
  document.querySelector(".btn-alert").onclick = () => {
    confirm("Are you sure you want to activate emergency lockdown?");
  };

});

