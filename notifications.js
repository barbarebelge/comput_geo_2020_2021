
const NOTIF_BLUE = "#4da6ff";
const FAILURE_RED = "#ff6666";
const SUCCESS_GREEN = "#66ff66";

class NotificationManager
{
    constructor()
    {
        var notifTimeout = null;
    }

    /** Hides all pending notifications and resets the corresponding html elements. */
    reset() {
        this.notifTimeout = null;
        var elem = document.getElementsByClassName("res-txt")[0];
        elem.innerText = "";
        elem.style.color = "black";
    }

    /** Shows a notification message for a given number of microseconds
     * (the default is 3 seconds). If a negative timeout is passed, the
     * notification will stay displayed indefinitely. */
    showNotification(txt, color = "black", nbMilisec = 3000) {
        if (this.notifTimeout) 
        {
            clearTimeout(this.notifTimeout);
        }

        var elem = document.getElementsByClassName("res-txt")[0];
        elem.innerText = txt;
        elem.style.color = color;

        if (nbMilisec > 0) 
        {
            this.notifTimeout = setTimeout(this.reset, nbMilisec);
        }
    }

}