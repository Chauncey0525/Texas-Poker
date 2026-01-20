// components/player-list/player-list.js
Component({
  properties: {
    players: {
      type: Array,
      value: []
    },
    currentPlayerIndex: {
      type: Number,
      value: -1
    },
    myPlayerIndex: {
      type: Number,
      value: -1
    },
    gamePhase: {
      type: String,
      value: 'waiting'
    },
    layout: {
      type: String,
      value: 'circle' // circle, list
    }
  },

  data: {},

  methods: {
    onPlayerTap(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('playertap', { index, player: this.properties.players[index] });
    }
  }
});
