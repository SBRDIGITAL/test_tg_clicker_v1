const $circle = document.querySelector('#circle')
const $score = document.querySelector('#score')

async function fetchScore() {
  const response = await fetch('/score')
  const data = await response.json()
  return data.score
}

async function updateScoreOnServer(score) {
  await fetch('/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  })
}

async function start() {
  const score = await fetchScore()
  setScore(score)
  setImage()
}

function setScore(score) {
  localStorage.setItem('score', score)
  $score.textContent = score
}

function setImage() {
  if (getScore() >= 50) {
    $circle.setAttribute('src', './assets/lizzard.png')
  }
}

function getScore() {
  return Number(localStorage.getItem('score')) ?? 0
}

async function addOne() {
  const newScore = getScore() + 1
  setScore(newScore)
  await updateScoreOnServer(newScore)
  setImage()
}

$circle.addEventListener('click', async (event) => {
  const rect = $circle.getBoundingClientRect()

  const offfsetX = event.clientX - rect.left - rect.width / 2
  const offfsetY = event.clientY - rect.top - rect.height / 2

  const DEG = 40

  const tiltX = (offfsetY / rect.height) * DEG
  const tiltY = (offfsetX / rect.width) * -DEG

  $circle.style.setProperty('--tiltX', `${tiltX}deg`)
  $circle.style.setProperty('--tiltY', `${tiltY}deg`)

  setTimeout(() => {
    $circle.style.setProperty('--tiltX', `0deg`)
    $circle.style.setProperty('--tiltY', `0deg`)
  }, 300)

  const plusOne = document.createElement('div')
  plusOne.classList.add('plus-one')
  plusOne.textContent = '+1'
  plusOne.style.left = `${event.clientX - rect.left}px`
  plusOne.style.top = `${event.clientY - rect.top}px`

  $circle.parentElement.appendChild(plusOne)

  await addOne()

  setTimeout(() => {
    plusOne.remove()
  }, 2000)
})

start()
