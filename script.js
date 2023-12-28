//api key 
const apiKey = 'live_f954af4638c0e3fd3d3e5aeb27e21cb392980668d1eae78e1ae6accdff388279505264c6fda8fd09eb3e00119038a101';
//api key 

async function searchCharacter() {
  const characterName = document.getElementById('characterName').value;
  await fetchCharacterInfoByName(characterName);
}

async function searchOCID() {
  const OCID = document.getElementById('characterName').value;
  await fetchCharacterInfoByOCID(OCID);
}


function changePlaceholder() {
  const searchType = document.getElementById('searchType');
  const characterNameInput = document.getElementById('characterName');
  
  if (searchType.value === 'name') {
    characterNameInput.placeholder = '닉네임을 입력하세요';
  } else if (searchType.value === 'ocid') {
    characterNameInput.placeholder = 'OCID를 입력하세요';
  }
}


async function GetOCIDFromAPI(characterName) {
  const apiURL = `https://open.api.nexon.com/maplestory/v1/id?character_name=${characterName}`;

  try {
    const response = await fetch(apiURL, {
      headers: {
        'Accept': 'application/json',
        'x-nxopen-api-key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      const ocid = data.ocid;
      return ocid; 
    } else {
      throw new Error('Failed to fetch OCID');
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}


async function fetchCharacterInfoByName(characterName) {
  const apiURL = `https://open.api.nexon.com/maplestory/v1/id?character_name=${characterName}`;

  try {
      const response = await fetch(apiURL, {
          headers: {
              'Accept': 'application/json',
              'x-nxopen-api-key': apiKey
          }
      });

      if (response.ok) {
          const data = await response.json();
          const ocid = data.ocid;

          const currentDate = new Date();
          currentDate.setDate(currentDate.getDate() - 1);
          const formattedDate = currentDate.toISOString().split('T')[0];

          const characterInfoURL = `https://open.api.nexon.com/maplestory/v1/ranking/union?date=${formattedDate}&ocid=${ocid}`;
          const characterInfoResponse = await fetch(characterInfoURL, {
              headers: {
                  'Accept': 'application/json',
                  'x-nxopen-api-key': apiKey
              }
          });

          if (characterInfoResponse.ok) {
              const characterInfoData = await characterInfoResponse.json();
              displayCharacterInfo(characterInfoData, characterName);
          } else {
              throw new Error('Failed to fetch character information');
          }
      } else {
          //throw new Error('Character not found');
          alert('캐릭터를 찾을 수 없습니다.');
      }
  } catch (error) {
      console.error(error);
      
  }
}


async function fetchCharacterInfoByOCID(ocid) {

  try {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    const formattedDate = currentDate.toISOString().split('T')[0];

    const characterInfoURL = `https://open.api.nexon.com/maplestory/v1/ranking/union?date=${formattedDate}&ocid=${ocid}`;
    const characterInfoResponse = await fetch(characterInfoURL, {
      headers: {
        'Accept': 'application/json',
        'x-nxopen-api-key': apiKey
      }
    });

    if (characterInfoResponse.ok) {
      const characterInfoData = await characterInfoResponse.json();
      displayCharacterInfo(characterInfoData);
    } else {
      alert('캐릭터를 찾을 수 없습니다.'); 
    }
  } catch (error) {
    console.error(error);

  }
}




async function displayCharacterInfo(data, characterName) {
  const characters = data.ranking;
  const characterInfoElement = document.getElementById('characterInfo');
  characterInfoElement.innerHTML = '';

  if (characters.length > 0) {
    for (const character of characters) {
      const characterDiv = document.createElement('div');
      characterDiv.classList.add('character');

      let jobInfo = '';
      if (character.sub_class_name) {
        jobInfo = `${character.class_name} - ${character.sub_class_name}`;
      } else {
        jobInfo = character.class_name;
      }

      const characterHTML = `
        <div class="character-info">
          <h2>${character.character_name}</h2>
          <div class="info-item">
            <span>월드:</span>
            <span>${character.world_name}</span>
          </div>
          <div class="info-item">
            <span>직업:</span>
            <span>${jobInfo}</span>
          </div>
          <div class="info-item">
            <span>유니온 레벨:</span>
            <span>${character.union_level}</span>
          </div>
          <button class="mapleButton">Maple.GG 이동</button>
          <button class="copyOCIDButton">OCID 복사</button>
        </div>
      `;

      characterDiv.innerHTML = characterHTML;
      characterInfoElement.appendChild(characterDiv);

      const mapleButton = characterDiv.querySelector('.mapleButton');
      mapleButton.addEventListener('click', () => {
        window.open(`https://maple.gg/u/${character.character_name}`, '_blank');
      });

      const copyOCIDButton = characterDiv.querySelector('.copyOCIDButton');
      const ocidValue = await GetOCIDFromAPI(character.character_name);

      copyOCIDButton.addEventListener('click', () => {
        copyToClipboard(ocidValue);
        alert('OCID 값이 복사되었습니다: ' + ocidValue);
      });
    }
  } else {
    //characterInfoElement.textContent = '캐릭터를 찾을 수 없습니다.';
    alert('캐릭터를 찾을 수 없습니다.'); 
  }

  characterInfoElement.classList.remove('hidden');
}

function copyToClipboard(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

document.getElementById('searchButton').addEventListener('click', function() {
  const searchType = document.getElementById('searchType').value;

  if (searchType === 'name') {
    searchCharacter();
  } else {
    searchOCID()
  }
});

document.getElementById('characterName').addEventListener('keyup', function(event) {
  const searchType = document.getElementById('searchType').value;

  if (event.key === 'Enter') {
    event.preventDefault();
    if (searchType === 'name') {
      searchCharacter();
    } else if (searchType === 'ocid') {
      searchByOCID();
    }
  }
});