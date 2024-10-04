<script>
export default {
  data() {
    return {
      currentTimerType: 'stopwatch',
      timerDisplay: '00:00:00',
      lapDisplay: '',
      laps: [],
      showLapTime: false,
      timerList: [],
      countdownInput: '',
    }
  },
  mounted() {
    this.port = chrome.runtime.connect({name: 'popup'});
    this.port.onMessage.addListener(this.handleMessage);
  },
  methods: {
    startTimer() {
      if (this.currentTimerType === 'stopwatch') {
        this.port.postMessage({action: 'startTimer'});
      } else if (this.currentTimerType === 'countdown') {
        const duration = parseInt(this.countdownInput, 10);
        this.port.postMessage({action: 'startCountdown', duration: duration});
      }
    },
    stopTimer() {
      if (this.currentTimerType === 'stopwatch') {
        this.port.postMessage({action: 'stopTimer'});
      } else if (this.currentTimerType === 'countdown') {
        this.port.postMessage({action: 'stopCountdown'});
      }
    },
    resetTimer() {
      if (this.currentTimerType === 'stopwatch') {
        this.port.postMessage({action: 'resetTimer'});
      } else if (this.currentTimerType === 'countdown') {
        this.port.postMessage({action: 'resetCountdown'});
      }
      this.lapDisplay = '';
      this.laps = [];
    },
    lap() {
      this.port.postMessage({action: 'lap'});
    },
    updateBadgeOptions() {
      this.port.postMessage({action: 'updateBadgeOptions', showLapTime: this.showLapTime});
    },
    menuItemClick(tab) {
      if (tab === 'Timer List') {
        this.port.postMessage({action: 'getTimerList'});
      } else if (tab === 'Current Timer') {
        // Update UI for current timer
      } else if (tab === 'Create Timer') {
        // Create timer logic
      }
    },
    handleMessage(request) {
      if (request.action === 'updateTimerList') {
        this.timerList = request.timers;
      } else if (request.action === 'updatePopup') {
        const hours = Math.floor(request.seconds / 3600);
        const minutes = Math.floor((request.seconds % 3600) / 60);
        const secs = request.seconds % 60;
        this.timerDisplay = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(secs)}`;

        if (request.laps.length > 0) {
          this.lapDisplay = `Lap ${request.currentLap}: ${this.padZero(Math.floor(request.lapSeconds / 60))}:${this.padZero(request.lapSeconds % 60)}`;
          this.laps = request.laps;
        }
      } else if (request.action === 'updateCountdown') {
        this.timerDisplay = `${request.hours}:${request.minutes}:${request.seconds}`;
      }
    },
    padZero(num) {
      return num.toString().padStart(2, '0');
    },
  },
}
</script>

<template>
  <div>
    <div id="timer-display">{{ timerDisplay }}</div>
    <div id="lap-display">{{ lapDisplay }}</div>
    <div id="controls">
      <button id="start" @click="startTimer">Start</button>
      <button id="stop" @click="stopTimer">Stop</button>
      <button id="reset" @click="resetTimer">Reset</button>
      <button id="lap" @click="lap">Lap</button>
    </div>
    
    
    <div class="menu">
      <div class="menu-timer-current active">Current Timer</div>
      <div class="menu-timer-list">Timer List</div>
      <div class="menu-timer-create">Create Timer</div>
  </div>
  <div id="timer-list" style="display: none;"></div>
  <div id="timer-type"></div>
  <div id="countdown-input-container" style="display: none;"></div>
    <input id="countdown-input" type="number" placeholder="Enter countdown duration">
</div>
    <div id="lap-list"></div>
    <br>
    <div id="badge-options">
      <label class="switch">
        <input type="checkbox" id="show-lap-time">
        <span class="slider round"></span>
      </label>
      <label for="show-lap-time"></label>
    </div>
    <br>
</template>

<style scoped>
body {
      display:flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 375px;
      height: auto;
      color: white;
      font-size: 30px;
      background-color: darkslategray;
    }

    #lap-display {
        font-size: 20px;
    }

    #lap-list {
        font-size: 15px;
        padding-top: 2%;
    }

    .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
    width: 40px;
    height: 20px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(20px);
    -ms-transform: translateX(20px);
    transform: translateX(20px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 20px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .menu {
  display: flex;
  justify-content: space-between;
  font-size: small;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5px;
  margin-top: 10px;
}

.menu div {
  padding: 1px 20px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.menu div:hover {
  border-bottom: 2px solid #ccc;
}

.menu div.active {
  border-bottom: 2px solid #2196F3;
  color: #2196F3;
}
</style>
