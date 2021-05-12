// const apiUrl = 'http://143.110.254.65';
const apiUrl = 'http://localhost';

document
  .getElementById('automatic')
  .addEventListener('change', onAutomaticCheckBoxClicked);

function onAutomaticCheckBoxClicked() {
  document.getElementById('automatic').checked === true
    ? (document.getElementById('result').style.display = 'none')
    : (document.getElementById('result').style.display = 'block');

  document.getElementById('automatic').checked === true
    ? (document.getElementById('hashtagsbox').style.display = 'none')
    : (document.getElementById('hashtagsbox').style.display = 'block');
}

function hashTagsCheckBoxTemplate(hashtags) {
  const hashTagsCheckBoxes = hashtags
    .map((hashtag, index) => {
      return `<li class="list-group-items">
    <label class="form-check-label" for={hashtag}>
    ${hashtag.replace(',', ' ')}
    </label>
    ${
      index < 5
        ? `<input
    class="form-check-input checkbox"
    checked
    type="checkbox"
    name="hashtag"
    value=${hashtag.replace(',', ' ')}
    />`
        : `<input
    class="form-check-input checkbox"
    type="checkbox"
    name="hashtag"
    value=${hashtag.replace(',', ' ')}
    />`
    }
    </li>`;
    })
    .join(' ');

  return hashTagsCheckBoxes;
}

async function callHashtag() {
  const res = await fetch(`${apiUrl}/hashtags`, {
    method: 'GET',
    headers: {
      accesstoken: getCookie('accesstoken'),
      accesstokensecret: getCookie('accesstokensecret'),
      woeid: document.getElementById('dropDown').value,
    },
  });
  const data = await res.json();

  const output = hashTagsCheckBoxTemplate(data.hashtags);

  document.getElementById('result').innerHTML = output;

  onCheckBoxClick();

  Array.from(document.getElementsByClassName('form-check-input')).forEach(
    (checbox) => checbox.addEventListener('change', onCheckBoxClick)
  );
}

var updateScheduledTask = function () {
  console.log('update');
  let scheduledtasks =
    localStorage.getItem('tasks') &&
    JSON.parse(localStorage.getItem('tasks'))
      .map((task) => {
        return `
  
      <tr>
      <td>${new Date(parseInt(task.created_at)).toLocaleString()} </td>
      <td>${
        task.hashtags
          ? task.hashtags
          : task.tweetText +
            ' ' +
            "<span class='text-info automaticbadge ml-3'>Automatic</span>"
      }</td>
      <td>${task.interval} min</td>
      <td><i onclick="stoptweet('${
        task.tweetId
      }')" class="icon fas fa-trash"></i></td>
      
      </tr>
      `;
      })
      .join(' ');
  if (scheduledtasks == null) {
    scheduledtasks = '';
  }
  document.getElementById('tables').innerHTML =
    '<tr> <th>Date</th><th>Tweet</th><th>Interval</th><th>Action</th></tr>' +
    scheduledtasks;
};

updateScheduledTask();

function getCookie(name) {
  var re = new RegExp(name + '=([^;]+)');
  var value = re.exec(document.cookie);
  return value != null ? unescape(value[1]) : null;
}

(function getTrend() {
  if (
    document.cookie.includes('accesstoken') &&
    document.cookie.includes('accesstokensecret')
  ) {
    document.getElementById('displayName').innerHTML = getCookie('displayName');
    document.getElementById('profilepic').src = getCookie('profilePic');

    //get all Countries
    fetch(`${apiUrl}/countries`, {
      method: 'GET',
      headers: {
        accesstoken: getCookie('accesstoken'),
        accesstokensecret: getCookie('accesstokensecret'),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // let countriesList = data.countries.sort(compareValues('country'));

        let countriesList = data.countries.sort(function (a, b) {
          if (a.country === b.country) {
            // Price is only important when cities are the same

            return a.place > b.place ? 1 : -1;
          }
          return a.country > b.country ? 1 : -1;
        });

        fetch('https://extreme-ip-lookup.com/json/')
          .then((res) => res.json())
          .then((response) => {
            console.log(response);
            let options = countriesList.map((country, index) => {
              console.log(country.country, response.country);
              if (
                response.country == country.country &&
                response.city == country.place
              ) {
                return `<option selected value='${country.woeid}'>${country.country} - ${country.place}</option>`;
              } else if (response.country == country.country) {
                if (country.country == country.place) {
                  return `<option selected value='${country.woeid}'>${country.country} - ${country.place}</option>`;
                }
              }
              return `<option value='${country.woeid}'>${country.country} - ${country.place}</option>`;
            });
            document.getElementById('dropDown').innerHTML = options;
            callHashtag();
            return 0;
          })
          .catch((data, status) => {});
      });

    fetch(`${apiUrl}/hashtags`, {
      method: 'GET',
      headers: {
        accesstoken: getCookie('accesstoken'),
        accesstokensecret: getCookie('accesstokensecret'),
        woeid: '1',
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const output = data.hashtags
          .map((hashtag, index) => {
            return `<li class="list-group-items">
        <label class="form-check-label" for={hashtag}>
        ${hashtag.replace(',', ' ')}
      </label>
        ${
          index < 5
            ? `<input
          class="form-check-input checkbox"
          checked
          type="checkbox"
          name="hashtag"
          value=${hashtag.replace(',', ' ')}
        />`
            : `<input
        class="form-check-input checkbox"
        type="checkbox"
        name="hashtag"
        value=${hashtag.replace(',', ' ')}
        />`
        }
        
        
     
      </li>`;
          })
          .join(' ');

        document.getElementById('result').innerHTML = output;
        onCheckBoxClick();
        Array.from(document.getElementsByClassName('form-check-input')).forEach(
          (checbox) => {
            checbox.addEventListener('change', onCheckBoxClick);
          }
        );
      });
  } else {
    // window.location.href = "http://127.0.0.1:4040/oauth"
    //domain ko link
    window.location.href = `${apiUrl}/oauth`;
  }
})();

document
  .getElementById('scheduleButton')
  .addEventListener('click', async (e) => {
    console.log('clicked');

    e.preventDefault();
    let allTasks = localStorage.getItem('tasks')
      ? JSON.parse(localStorage.getItem('tasks'))
      : [];
    if (allTasks.length != 0) {
      let lastTask = allTasks[allTasks.length - 1];
      console.log(lastTask);
      let differenceinMin = (Date.now() - lastTask.created_at) / 1000 / 60;
      console.log(differenceinMin);
    }

    var interval = document.getElementById('tweetInterval').value;
    var tweet = document.getElementById('tweetText').value;
    var statusOnly = document.getElementById('status').value;
    var isUploaded =
      document.getElementById('file-upload').value == '' ? false : true;
    var isAutomatic = document.getElementById('automatic').checked;

    tweet = isAutomatic ? statusOnly : tweet + ' ' + statusOnly;

    if (tweet == '' || interval == '') {
      document.getElementById('notification').innerHTML =
        'Please fill the details';
      return;
    }
    if (isUploaded) {
      var formData = new FormData();
      formData.append('file', document.getElementById('file-upload').files[0]);
      try {
        const response = await fetch(`${apiUrl}/uploadMedia`, {
          method: 'POST',
          headers: {
            accesstoken: getCookie('accesstoken'),
            accesstokensecret: getCookie('accesstokensecret'),
          },
          body: formData,
        });
        const data = await response.json();
        const mediaId = data.media_id;
        console.log(tweet);
        const twitResponse = await fetch(`${apiUrl}/tweet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accesstoken: getCookie('accesstoken'),
            accesstokensecret: getCookie('accesstokensecret'),
          },

          body: JSON.stringify({
            hashtags: tweet,
            interval: interval,
            mediaId,
            isAutomatic,
            woeid: document.getElementById('dropDown').value,
          }),
        });

        const twitResponseJson = await twitResponse.json();

        console.log(twitResponseJson);

        document.getElementById(
          'notification'
        ).innerHTML = `<p style="color:white;">${
          twitResponseJson.message.charAt(0).toUpperCase() +
          twitResponseJson.message.slice(1)
        }</p>`;
        document.getElementById('maintitle').style.background = 'green';
        document.getElementById('maintitle').style.color = 'white';

        setTimeout(function () {
          document.getElementById('notification').innerHTML = 'Make a Tweet';
          document.getElementById('maintitle').style.background = '#243e61';
          document.getElementById('maintitle').style.color = '#d5e5fa';
        }, 3000);

        let tasks = localStorage.getItem('tasks')
          ? JSON.parse(localStorage.getItem('tasks'))
          : [];
        tasks.push(twitResponseJson);

        localStorage.setItem('tasks', JSON.stringify(tasks));

        updateScheduledTask();
      } catch (err) {
        console.log(err);
      }
    } else {
      const twitResponse = await fetch(`${apiUrl}/tweet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getCookie('accesstoken'),
          accesstokensecret: getCookie('accesstokensecret'),
        },
        body: JSON.stringify({
          hashtags: tweet,
          interval: interval,
          isAutomatic,
          woeid: document.getElementById('dropDown').value,
        }),
      });
      const twitResponseJson = await twitResponse.json();
      document.getElementById('notification').innerHTML =
        twitResponseJson.message.charAt(0).toUpperCase() +
        twitResponseJson.message.slice(1);
      document.getElementById('maintitle').style.background = 'green';
      document.getElementById('maintitle').style.color = 'white';
      setTimeout(function () {
        document.getElementById('notification').innerHTML = 'Make a Tweet';
        document.getElementById('maintitle').style.background = '#243e61';
        document.getElementById('maintitle').style.color = 'white';
      }, 3000);

      let tasks = localStorage.getItem('tasks')
        ? JSON.parse(localStorage.getItem('tasks'))
        : [];
      tasks.push(twitResponseJson);
      localStorage.setItem('tasks', JSON.stringify(tasks));

      updateScheduledTask();
    }
  });

var hashtags = [];
function onCheckBoxClick(e) {
  e ? e.preventDefault() : '';
  const checkboxes = document.querySelectorAll('input[name="hashtag"]:checked');
  hashtags = [];
  checkboxes.forEach((checkbox) => {
    hashtags.push(checkbox.value);
  });
  var hastagsList = '';
  hashtags.forEach((hashtag) => {
    hastagsList = hastagsList + ' ' + hashtag;
  });
  var text = document.getElementById('tweetText');
  text.value = hastagsList;
}

document.getElementById('revokeAccess').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('revokeAccess').style.display = 'none';
  document.getElementById('scheduleBtn').innerHTML =
    "<button class='btn btn-warning' onclick='reload()' id='reload'>Login</button>";
  document.getElementById('scheduleButton').setAttribute('disabled', true);
  document.getElementById('displayName').style.opacity = 0;
  document.getElementById('profilepic').style.opacity = 0;
  document.getElementById('dashboard').innerHTML =
    '<div class="logout_state_dashboard"><p>Schedule Your Tweets</p>Twit Bot</div>';

  deleteCookies();
});

function deleteCookies() {
  var allCookies = document.cookie.split(';');

  // The "expire" attribute of every cookie is
  // Set to "Thu, 01 Jan 1970 00:00:00 GMT"
  for (var i = 0; i < allCookies.length; i++)
    document.cookie = allCookies[i] + '=;expires=' + new Date(0).toUTCString();
}

function reload() {
  location.reload();
}

async function stoptweet(tweetId) {
  console.log('Clicked delete');
  const response = await fetch(`${apiUrl}/deleteTweet`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tweetId }),
  });
  const responseJson = await response.json();
  const filteredTasks = JSON.parse(localStorage.getItem('tasks')).filter(
    (task) => {
      return task.tweetId != responseJson.tweetId;
    }
  );
  localStorage.setItem('tasks', JSON.stringify(filteredTasks));

  updateScheduledTask();
}

var loadFile = function (event) {
  var image = document.getElementById('output');
  image.src = URL.createObjectURL(event.target.files[0]);
};

function checkCharacterLimit() {
  if (document.getElementById('tweetText').value.length > 239) {
    document.getElementById('notification').innerHTML =
      'Character Limit Excedded';
  } else {
    document.getElementById('notification').innerHTML = 'Make Tweet';
  }
}

// restricting tweetInterval to min 15 minutes
document.getElementById('tweetInterval').oninput = function () {
  var min = parseInt(this.min);

  if (parseInt(this.value) < min) {
    this.value = min;
  }
};

function removeWarning() {
  document.getElementById('warning').remove();
}
