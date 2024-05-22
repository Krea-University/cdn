  /*Krea SSO @2021 |Copyright The Closure Library Authors.|SPDX-License-Identifier: Apache-2.0| AUTHOR - SENTHIL NASA*/


  var getx = function (e) {
    if ("" == e) return {};
    for (var i = {}, o = 0; o < e.length; ++o) {
      var t = e[o].split("=", 2);
      1 == t.length ? i[t[0]] = "" : i[t[0]] = decodeURIComponent(t[1].replace(/\+/g, " "))
    }
    return i
  }(window.location.search.substr(1).split("&"));
  const client_id = getx.client_id,
    redirect_uri = getx.redirect_uri;

  function check(e) {
    for (i = 0; i < e.length; i++)(null == e[i] || null == e[i] || " " == e[i] || "" == e[i]) && window.location.replace("../403/")
  }
  check([client_id, redirect_uri]);
  var Gtoken;

  const tab = document.querySelector(".container");


  function loginView() {

    tab.className = "container staff"
  }

  function resetView() {
    tab.className = "container reset"
  }


  function loader(a = true) {
    if (a) {
      $("#loader").addClass('active');
    } else {
      $("#loader").removeClass('active');
    }
  }

  function otpShow(a = true) {
    if (a) {
      $("#otp").addClass('active');
    } else {
      $("#otp").removeClass('active');

    }
  }

  function passwordShow(a = true) {
    if (a) {
      $("#password").addClass('active');
    } else {
      $("#password").removeClass('active');

    }
  }


  function toast(txt) {
    $("#toast").removeClass("show");
    $("#toast").text(txt);
    $("#toast").addClass("show");
    setTimeout(function () {
      $("#toast").removeClass("show");
    }, 3000);
  }

  firebase.initializeApp({
    apiKey: document.querySelector('meta[name="fApiKey"]').content,
  });




  $(document).ready(function () {
    setTimeout(function () {
      loader(0);
    }, 1500);

  });

  var token = "";

  function setToken(t) {
    token = t;
    setTimeout(function () {
      submitToken();
    }, 500);
    if (isValidHttpUrl(redirect_uri)) {
      submitToken();
      loader(1);
      return;
    }
    submitToken();
    tab.className = "container"

  }

  function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  function submitToken() {
    window.location.replace(redirect_uri + "?token=" + token)
    closeTab();
  }

  var googleUser = {};

  function makegSign() {
    let url = "oauthHandler?client_id=" + client_id + "&redirect_uri=" + redirect_uri;
    console.log(url);
    const popupCenter = ({
      url,
      title,
      w,
      h
    }) => {
      const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
      const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
      const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
      const systemZoom = width / window.screen.availWidth;
      const left = (width - w) / 2 / systemZoom + dualScreenLeft
      const top = (height - h) / 2 / systemZoom + dualScreenTop
      const newWindow = window.open(url, title,
        `
          scrollbars=yes,
          width=${w / systemZoom}, 
          height=${h / systemZoom}, 
          top=${top}, 
          left=${left}
          `
      )

      if (window.focus) newWindow.focus();
      return newWindow
    }
    var win = popupCenter({
      url: url,
      title: "Erp Authentication System !",
      w: 500,
      h: 500
    });
    window.addEventListener('message', function (e) {
      var d = JSON.parse(e.data);
      if (d.ok) {
        setToken(d.data);
      } else {
        toast(d.error);
      }
      clearInterval(intervalId);
    }, false);
    var intervalId = setInterval(function () {
      if (win == undefined || win.closed) {
        clearInterval(intervalId);
        toast("Google Signin Closed by User !");
      }
    }, 500);
  }


  function ajax(url, data = {}, func = (data) => {}, errFunc = () => {}) {
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      processData: false,
      contentType: "application/json; charset=UTF-8",
      dataType: 'json',
      success: (res) => {
        console.log(res);
        if (res.ok === true)
          func(res.data);
        else {
          if (res['err-code'] == 403) {
            window.location.replace("../403/");
          }
          toast(res['err-msg']);
          errFunc();
        }
      },
      error: (qXHR, textStatus, error) => {
        console.log(error);
        toast(textStatus);
        errFunc();
      }
    });
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sendOtp', {
    'size': 'invisible',
    'callback': function (token) {
      console.log("Otp sen");
      loader(1);
      sendOtp(token);
    }
  });
  window.recaptchaVerifier.render().then(function (widgetId) {
    window.recaptchaWidgetId = widgetId;
  });


  function resetReCaptcha() {
    if (typeof grecaptcha !== 'undefined' &&
      typeof window.recaptchaWidgetId !== 'undefined') {
      grecaptcha.reset(window.recaptchaWidgetId);
    }
  }


  $("#passwordReset").submit(function (e) {
    e.preventDefault();
    console.log("clicked")
    $('#sendOtp').click();
  });

  function sendOtp(token) {

    var unindexed_array = $("#passwordReset").serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });
    indexed_array['client_id'] = client_id;
    indexed_array['redirect_uri'] = redirect_uri;
    indexed_array['token'] = token;

    var func = (data) => {
      $('#sssid').val(data);
      loader(0);
      passwordShow();
    }
    var err = () => {
      loader(0);
    }
    resetReCaptcha();

    ajax('../Auth/api/doGetOtp', indexed_array, func, err);
  }

  function resendOtp() {
    $("#passwordReset").submit();
  }

  $("#otpSubmit").submit(function (e) {
    e.preventDefault();
    if ($("#new_pass").val() != $("#re_new_pass").val()) {
      toast("Both Password Should be same !");
      return;
    }
    passwordShow(0);
    loader(1);


    var unindexed_array = $("#otpSubmit").serializeArray();
    var indexed_array = {};
    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });
    indexed_array['client_id'] = client_id;
    indexed_array['redirect_uri'] = redirect_uri;

    var func = (_) => {
      alert("Password Updated Sucessfully");
      window.location.reload(1);
    }
    var err = () => {
      loader(0);
      passwordShow(1);
    }
    ajax('./api/doVerifyOtp', indexed_array, func, err);
  });

  function closeTab() {
    setTimeout(function () {
      window.close();
    }, 100000);
  }
  if(navigator&&navigator.userAgent){var t=navigator.userAgent.match(/opera|chrome|safari|firefox|msie|trident(?=\/)/i);t&&t[0].search(/trident|msie/i)<0&&(window.console.log("%cSTOP!","color:red;font-size:xx-large;font-weight:bold;"),window.console.log("%cThis is a browser feature intended for developers. Do not enter or paste code which you don't understand. It may allow attackers to steal your information or impersonate you.\nSee https://en.wikipedia.org/wiki/Self-XSS for more details","font-size:large;"))}else window.console.log("STOP!\nThis is a browser feature intended for developers. Do not enter or paste code which you don't understand. It may allow attackers to steal your information or impersonate you.\nSee https://en.wikipedia.org/wiki/Self-XSS for more details");