
const NOTIF_BLUE = "#4da6ff";
const FAILURE_RED = "#ff6666";
const SUCCESS_GREEN = "#66ff66";

var notifTimeout = null;

/** Hides all pending notifications and resets the corresponding html elements. */
function resetNotifications() {
    console.log("reset notifications");
    // if (notifTimeout) 
    // {
    //     clearTimeout(notifTimeout);
    // }

    notifTimeout = null;
    var elem = document.getElementsByClassName("res-txt")[0];
    elem.innerText = "";
    elem.style.color = "black";
}

/** Shows a notification message for a given number of microseconds
 * (the default is 3 seconds). If a negative timeout is passed, the
 * notification will stay displayed indefinitely. */
function showNotification(txt, color = "black", nbMilisec = 4000) {

    if (notifTimeout) 
    {
        clearTimeout(notifTimeout);
    }

    var elem = document.getElementsByClassName("res-txt")[0];
    elem.innerText = txt;
    elem.style.color = color;

    if (nbMilisec > 0) 
    {
        notifTimeout = setTimeout(function(){resetNotifications();}, nbMilisec);
    }
}

