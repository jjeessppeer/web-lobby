class LobbyShipItem extends HTMLDivElement {
  constructor() {
    super();
    this.interactive = true;
    this.name = "NO_NAME";
    this.gun_dropdowns = [];

    this.classList.add('LobbyShipItem');
    this.innerHTML = `
            <div>NAME - uninitialized</div>
            <br>
            <div>Ship<br></div>
            <div>Weapons</div>
            <button>Lock in</button>
            `;

    // this.gunSelections = this.querySelector("div::nth-child(3)");
    this.statusDiv = this.querySelector(":scope>div:nth-of-type(1)");
    this.shipSelectionRow = this.querySelector(":scope>div:nth-of-type(2)");
    this.gunSelectionRow = this.querySelector(":scope>div:nth-of-type(3)");

    this.shipDropdown = document.createElement('div', { is: 'item-dropdown' });

    this.shipDropdown.addEventListener('item-selected', event => this.setShip(event.target.img.dataset.item_id));
    this.shipDropdown.addEventListener('item-selected', event => {postLoadout(this.getLoadoutArray())});

    this.querySelector('button').addEventListener('click', event => {
      lockLoadout();
    });



    this.shipDropdown.setContent(ships);


    this.shipSelectionRow.appendChild(this.shipDropdown);

    this.activeShip = undefined;
    this.shipDropdown.selectItem(ships[0].name, ships[0].img, 0);

    this.setIsMine(false);
    this.setStatus('uninitialized');
  }

  getLoadoutArray(){
    let shipIdx = parseInt(this.shipDropdown.img.dataset.item_id);
    let gunArray = [];
    this.gunSelectionRow.querySelectorAll('.dropdown').forEach(dropdown => {
      gunArray.push(parseInt(dropdown.img.dataset.item_id));
    });
    return [shipIdx, gunArray];
  }

  setIsMine(enable){
    this.setInteractive(enable);
    this.classList.toggle('isMine', enable);
  }

  setInteractive(enable){
    this.interactive = enable;
    this.shipDropdown.setEnabled(enable);
    this.gunSelectionRow.querySelectorAll('.dropdown').forEach(dropdown => {
      // dropdown.enabled = enable;
      dropdown.setEnabled(enable);
    });
  }

  setStatus(status){
    this.status = status;
    this.statusDiv.innerHTML = `${this.name}&nbsp;&nbsp;&nbsp;&nbsp;${status}`;
  }

  setGuns(gunList){
    for (let i=0; i<this.gun_dropdowns.length; i++){
      this.gun_dropdowns[i].selectItem(light_guns[gunList[i]].name, light_guns[gunList[i]].img, gunList[i]);
    }
  }

  setPicking(enable) {
    this.classList.toggle('picking', enable);
  }

  setShip(shipIndex) {
    if (this.activeShip != undefined && ships[shipIndex].name == ships[this.activeShip].name) return;
    console.log("selecting new ship")
    this.activeShip = shipIndex;

    this.gunSelectionRow.innerHTML = "Weapons<br>";
    this.shipDropdown.img.name = ships[shipIndex].name;
    this.shipDropdown.img.src = ships[shipIndex].img;
    this.shipDropdown.img.dataset.item_id = shipIndex;

    let shipData = ships[shipIndex];
    this.gun_dropdowns = [];
    for (let i = 0; i < shipData.guns.length; i++) {
      let dropdown = document.createElement('div', { is: 'item-dropdown' });
      dropdown.setContent(light_guns);
      dropdown.setEnabled(this.interactive);
      dropdown.addEventListener('item-selected', event => {postLoadout(this.getLoadoutArray())});
      this.gun_dropdowns.push(dropdown);
      this.gunSelectionRow.appendChild(dropdown);
    }
  }
}

class ItemDropdown extends HTMLDivElement {
  constructor() {
    super();

    this.enabled = true;

    this.classList.add('dropdown');
    this.innerHTML = `
        <div class="dropdown-content">
        </div>
        <img class="dropbtn" src="">
        `.trim();
    this.content = this.querySelector(".dropdown-content");
    this.img = this.querySelector('.dropbtn');
    this.querySelector(".dropbtn").addEventListener('click', event => this.toggleDropdown(event));
    
  }

  setEnabled(enable){
    this.enabled = enable;
    this.classList.toggle('disabled', !enable);
  }

  setContent(dataset) {
    // Dataset is array of [name, image_src]
    this.content.innerHTML = '';
    for (var i = 0; i < dataset.length; i++) {
      let img = document.createElement('img');
      img.title = dataset[i].name;
      img.src = dataset[i].img;
      img.dataset.item_id = i;
      img.addEventListener('click', event => {
        this.selectItem(event.target.title, event.target.src, event.target.dataset.item_id);
        this.dispatchEvent(new Event('item-selected'));
      });
      this.content.appendChild(img);
    }
    this.selectItem(dataset[0].name, dataset[0].img, 0);
  }

  selectItem(title, src, item_id) {
    this.img.title = title;
    this.img.src = src;
    this.img.dataset.item_id = item_id;
  }
  toggleDropdown(event) {
    if (!this.enabled) return;
    this.classList.toggle('active')
  }

}

class BanElement extends HTMLDivElement {
  constructor() {
    super();
    this.classList.add('BanElement');
    this.innerHTML = `
      <h3>Ban gun</h3>
      <div>
        <button>Ban</button>
        <button>Skip</button>
      </div>
      `;

    this.dropdown = document.createElement('div', { is: 'item-dropdown' });
    this.banBtn = this.querySelector('button:nth-child(1)');
    this.skipBtn = this.querySelector('button:nth-child(2)');
    this.header = this.querySelector('h3');
    this.setBanType('ship');
    this.querySelector('div').prepend(this.dropdown);
    // // this.prepend(this.dropdown);
    
    this.dropdown.addEventListener('item-selected', event => {
      let item_id = parseInt(this.dropdown.img.dataset.item_id);
      if (this.ban_type == 'gun')
        postGunBan(item_id);
      else if (this.ban_type == 'ship')
        postShipBan(item_id);
    });

    this.banBtn.addEventListener('click', event => {
      postBanLock();
    });
    this.skipBtn.addEventListener('click', event => {
      postBanSkip();
    });


  
  }

  setInteractive(enable){
    this.dropdown.setEnabled(enable);
    this.banBtn.disabled = !enable;
    this.skipBtn.disabled = !enable;
  }

  setBanType(banType){
    this.ban_type = banType;
    if (banType == "ship"){
      this.header.textContent = "Ban ship";
      this.dropdown.setContent(ships);
    }
    if (banType == "gun"){
      this.header.textContent = "Ban gun";
      this.dropdown.setContent(light_guns);
    }
  }
}

// class ModeratorElement extends HTMLDivElement

customElements.define('lobby-ban-element', BanElement, { extends: 'div' });
customElements.define('lobby-ship-item', LobbyShipItem, { extends: 'div' });
customElements.define('item-dropdown', ItemDropdown, { extends: 'div' });