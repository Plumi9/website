let player = document.getElementById('player');

let arrow_up = document.getElementById('arrow_up');
let pressed_arrow_up = document.getElementById('pressed_arrow_up');
let arrow_down = document.getElementById('arrow_down');
let pressed_arrow_down = document.getElementById('pressed_arrow_down');
let arrow_left = document.getElementById('arrow_left');
let pressed_arrow_left = document.getElementById('pressed_arrow_left');
let arrow_right = document.getElementById('arrow_right');
let pressed_arrow_right = document.getElementById('pressed_arrow_right');
let top_wall = document.getElementById('top-wall');
let bottom_wall = document.getElementById('bottom_wall');

// List of object to check for collision for movement
let LIST_OF_OBJECTS = [top_wall,
                      arrow_up, pressed_arrow_up, arrow_down, pressed_arrow_down, arrow_left, pressed_arrow_left, arrow_right, pressed_arrow_right,
                      ];
let object_Positions = LIST_OF_OBJECTS.map(object => object.getBoundingClientRect());

// List of items for the Gallery on Page 2
let LIST_OF_ITEMS = document.querySelectorAll('.list .item');
let hoveredItems = new Set();  // Track which items currently have the hover class

// Values for movement
const MOVEMENT_SPEED = 10;
let positionX = Math.round(window.innerWidth/2);
let positionY = 0;
let keyPresses = {};

// Key event listeners
window.addEventListener('keydown', keyDownListener);
function keyDownListener(event) {
  keyPresses[event.key] = true;
}

window.addEventListener('keyup', keyUpListener);
function keyUpListener(event) {
  keyPresses[event.key] = false;
  switch(event.key) {
    case 'w':
      pressed_arrow_up.setAttribute("hidden", "hidden");
      break;
    case 's':
      pressed_arrow_down.setAttribute("hidden", "hidden");
      break;
    case 'a':
      pressed_arrow_left.setAttribute("hidden", "hidden");
      break;
    case 'd':
      pressed_arrow_right.setAttribute("hidden", "hidden");
      break;
  }
}

// Handle hover effect when player "hovers over" an item
function handleItemHoverEffect() {
  let player_Position = {
    left: positionX,
    right: positionX + player.offsetWidth,
    top: positionY,
    bottom: positionY + player.offsetHeight,
  };

  LIST_OF_ITEMS.forEach((item, index) => {
    let item_Position = item.getBoundingClientRect();
    let adjusted_Item_Position = {
      top: item_Position.top + window.scrollY,
      bottom: item_Position.bottom + window.scrollY,
      left: item_Position.left + window.scrollX,
      right: item_Position.right + window.scrollX,
    };

    // Check if the player is colliding with the item
    let isColliding = !(player_Position.top > adjusted_Item_Position.bottom ||
                        player_Position.bottom < adjusted_Item_Position.top ||
                        player_Position.left > adjusted_Item_Position.right ||
                        player_Position.right < adjusted_Item_Position.left);

    if (isColliding) {
      // If the item is colliding and doesn't already have the hover class, add it
      if (!hoveredItems.has(item)) {
        item.classList.add('hover');
        hoveredItems.add(item);  // Track that this item has hover
      }
    } else {
      // If the item is not colliding and has the hover class, remove it
      if (hoveredItems.has(item)) {
        item.classList.remove('hover');
        hoveredItems.delete(item);  // Remove from the hover-tracked set
      }
    }
  });
}

// Check for object collision
function isColliding(newPositionX, newPositionY) {
  let player_Position = {
    left: newPositionX,
    right: newPositionX + player.offsetWidth,
    top: newPositionY,
    bottom: newPositionY + player.offsetHeight,
  };

  for (let object of LIST_OF_OBJECTS) {
    let object_Position = object.getBoundingClientRect();
    let adjusted_Object_Position = {
      top: object_Position.top + window.scrollY,
      bottom: object_Position.bottom + window.scrollY,
      left: object_Position.left + window.scrollX,
      right: object_Position.right + window.scrollX
    };

    if (!(player_Position.top > adjusted_Object_Position.bottom || 
          player_Position.bottom < adjusted_Object_Position.top ||
          player_Position.left > adjusted_Object_Position.right ||
          player_Position.right < adjusted_Object_Position.left)) {
      // Collision detected
      return true;
    }
  }
  return false;
}

// Scroll Logic
let has_scrolled = false;
let isScrolling = false;
let scroll_counter = 1;
function pageScroll() {
  const targetScrollY = 1240 * scroll_counter; // The target scroll position
  const scrollStep = 20; // How many pixels to scroll per frame
  const duration = 2000; // Duration of the scroll in milliseconds
  
  if (!has_scrolled) {
    has_scrolled = true; // Ensure this runs only once per scroll action
    
    const scrollInterval = setInterval(() => {
      const currentScrollY = window.scrollY;
      
      // Stop if we've reached or exceeded the target scroll position
      if (currentScrollY >= targetScrollY) {
        clearInterval(scrollInterval);
        window.scrollTo(0, targetScrollY); // Ensure we snap to the target
        return; // Exit the function
      }

      window.scrollBy(0, scrollStep);
    }, 16); // Approximately 60 FPS

    teleport_Player_to_newPositionY(targetScrollY);
    scroll_counter += 1;

    // Reset `has_scrolled` after the scroll completes (duration of 2 seconds)
    setTimeout(() => {
      has_scrolled = false; // Reset the scroll lock
    }, duration); // Matches the scroll animation duration
  }
}

function teleport_Player_to_newPositionY(newPositionY){
  positionY = newPositionY;
}

function check_Position_to_scroll() {
  if (!isScrolling && positionY >= window.innerHeight + window.scrollY) {
    isScrolling = true; // Disable further checks during scroll
    pageScroll();
    setTimeout(() => { 
      isScrolling = false; // Re-enable scroll check after 2 seconds
    }, 1000); 
  }
}

// Actual game loop
function gameLoop() {
  let moveX = 0;
  let moveY = 0;

  // User Input
  if (keyPresses.w) {
    moveY = -MOVEMENT_SPEED;
    pressed_arrow_up.removeAttribute("hidden");
  } 
  if (keyPresses.s) {
    moveY = MOVEMENT_SPEED;
    pressed_arrow_down.removeAttribute("hidden");
  }
  if (keyPresses.a) {
    moveX = -MOVEMENT_SPEED;
    pressed_arrow_left.removeAttribute("hidden");
  } 
  if (keyPresses.d) {
    moveX = MOVEMENT_SPEED;
    pressed_arrow_right.removeAttribute("hidden");
  }

  // Normalize diagonal movement speed
  if (moveX !== 0 && moveY !== 0) {
    moveX *= Math.SQRT1_2;  // Math.SQRT1_2 is equivalent to 1/sqrt(2)
    moveY *= Math.SQRT1_2;
  }

  let newPositionX = positionX + moveX;
  let newPositionY = positionY + moveY;
  
  // Check for collision
  if(!isColliding(newPositionX, positionY)){
    positionX = newPositionX;
  }
  if(!isColliding(positionX, newPositionY)){
    positionY = newPositionY;
  }

  // Update Player position to DOM
  player.style.left = positionX + 'px';
  player.style.top = positionY + 'px';

  check_Position_to_scroll();

  // Handle hover effects
  handleItemHoverEffect();

  window.requestAnimationFrame(gameLoop);
}

window.requestAnimationFrame(gameLoop);