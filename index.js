// 定義游戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

// 花色圖案
const Symbols = [
  // 黑桃
  'https://cdn-icons-png.flaticon.com/512/1/1438.png',
  // 愛心
  'https://cdn-icons-png.flaticon.com/512/138/138533.png',
  // 方塊
  'https://cdn-icons-png.flaticon.com/512/138/138534.png',
  // 梅花
  'https://cdn-icons-png.flaticon.com/512/2869/2869376.png'
]

// 與 “視覺呈現” 相關的動作全部儲存在 MVC 概念中的 view
const view = {
  // 獲取每張卡的背面
  getCardBack(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },

  // 獲取每張卡片並渲染
  getCardElement(index) {
    // 使用 this 調用 object array 中的 function
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    // return `<div class="card back" data-index="${index}">
    //   <p>${number}</p>
    //   <img src="${symbol}" alt="">
    //   <p>${number}</p>
    // </div>`
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  // 更換特定數字為字母
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default: return number
    }
  },

  // 產生卡片並渲染
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // rootElement.innerHTML = this.getCardElement()
    // rootElement.innerHTML = Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join('')

    // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')

    // rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardBack(index)).join('')
    rootElement.innerHTML = indexes.map(index => this.getCardBack(index)).join('')
  },

  // flipCard(card) {
  //   if (card.matches('.back')) {
  //     card.classList.remove('back')
  //     card.innerHTML = this.getCardElement(Number(card.dataset.index))
  //     return
  //   }
  //   card.classList.add('back')
  //   card.innerHTML = ""
  // },

  // 優化
  flipCards(...cards) {
    cards.map(card => {
      if (card.matches('.back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardElement(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = ""
    })
  },

  // pairedCard(card) {
  //   card.classList.add('paired')
  // },

  // 優化
  pairedCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 打亂數字 array
const utility = {
  // Fisher-Yates Shuffle 演算法
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    // 從最後一張牌往前，依序只要更換 51 次即可
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        // 以 結構賦值 進行 array 裏相對應位置的號碼互換
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    // 記得要回傳值！！！
    return number
  }
}

// 與 “資料” 相關的動作全部儲存在 MVC 概念中的 model
const model = {
  revealedCards: [],

  revealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0
}

// 與 “控制” 相關的動作全部儲存在 MVC 概念中的 controller
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  displayCardAction(card) {
    if (!card.classList.contains("back")) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        // console.log(this.currentState)
        this.currentState = GAME_STATE.SecondCardAwaits
        // console.log(this.currentState)
        // console.log(model.revealedCards)
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // console.log(this.currentState)
        // console.log(model.revealedCards)
        // console.log(model.revealedCardsMatched())
        if (model.revealedCardsMatched()) {
          // 配對成功
          // console.log('matched')
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          // view.pairedCard(model.revealedCards[0])
          // view.pairedCard(model.revealedCards[1])
          view.pairedCards(...model.revealedCards)
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
          model.revealedCards = []
        } else {
          // 配對失敗
          // console.log('fail')
          // setTimeout(() => {
          //   this.currentState = GAME_STATE.CardsMatchFailed
          //   // view.flipCard(model.revealedCards[0])
          //   // view.flipCard(model.revealedCards[1])
          //   view.flipCards(...model.revealedCards)
          //   this.currentState = GAME_STATE.FirstCardAwaits
          //   model.revealedCards = []
          // }, 1000)
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(() => {
            controller.resetCards()
            // this 也可以用，但這裏會指向全局，而非 controller，但因爲全局只存在一個 resetCards，所以也可以跑得起來
            // this.resetCards()
          }, 1000)

        }
      // if (model.revealedCardsMatched()) {
      //   console.log('matched')
      //   this.currentState = GAME_STATE.CardsMatched

      // }
    }

  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    this.currentState = GAME_STATE.FirstCardAwaits
    model.revealedCards = []
  },
}


// view.displayCards()
// console.log(utility.getRandomNumberArray(52))
controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // view.flipCard(card)
    // console.log(card)
    controller.displayCardAction(card)
  })
})


// 如果以此方式需要多加一些邏輯判斷 或是在各別 card 裏的 element 都加上 dataset
// document.querySelector('#cards').addEventListener('click', event => {
//   const target = event.target
//   console.log(target)
// })
