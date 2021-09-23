//loading objects
const imputFirstName = document.querySelector('.firstname-input');
const imputSecondName = document.querySelector('.secondname-input');
const imputEmail = document.querySelector('.email-input');
const imputUsername = document.querySelector('.username-input');
const imputPassword = document.querySelector('.password-input');
const FormRegister = document.querySelector('.register-form');
const formAlertDOM = document.querySelector('.form-alert');
const imputs = document.querySelectorAll('.form-input');

//submit login
FormRegister.addEventListener('submit', async (e) => {
  const accessToken = localStorage.getItem('accessToken');
  e.preventDefault();
  const firstName = imputFirstName.value;
  const secondName = imputSecondName.value;
  const email = imputEmail.value;
  const username = imputUsername.value;
  const password = imputPassword.value;
  // console.log(imputs);

  if (!firstName || !secondName || !email || !username || !password) {
    console.log('some informations are missing');
    return;
  }

  try {
    const { message, success } = await axios.post(
      '/api/v1/register',
      { firstName, lastName: secondName, email, username, password },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    //get token and insert into local storage
    formAlertDOM.style.display = 'block';
    formAlertDOM.style.color = 'green';
    formAlertDOM.textContent = 'User created with success!';
    imputs.forEach((imput) => (imput.value = ''));
    setTimeout(() => {
      formAlertDOM.style.display = 'none';
      formAlertDOM.style.color = 'red';
    }, 3000);
  } catch (err) {
    formAlertDOM.style.display = 'block';
    formAlertDOM.textContent = err.response.data.message;
    console.log(err.response.data);
    setTimeout(() => {
      formAlertDOM.style.display = 'none';
    }, 2000);
  }
});

// check refresh token function
async function checkRefreshToken(refreshToken) {
  try {
    const {
      data: { accessToken: newAccessToken },
    } = await axios.post(
      `/api/v1/token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    localStorage.setItem('accessToken', newAccessToken);
    document.location.reload();
  } catch (error) {
    console.log(error.response);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.location.reload();
  }
}

async function registerLoadPage() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  if (!accessToken && !refreshToken) {
    //dont have access
    document.location.href = '/';
    return;
  }

  try {
    // verify route for loading the page
    const {
      data: { success },
    } = await axios.get(`/api/v1/verify`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (success === false) {
      document.location.href = '/';
      return;
    }
  } catch (err) {
    if (err.response.status === 401) {
      checkRefreshToken(refreshToken);
    }
    console.log(err);
  }
}

registerLoadPage();

const logoutbtn = async (key) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const {
      data: { message, success },
    } = await axios.post(
      `/api/v1/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (success === true) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.location.reload();
    }
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.location.reload();
    // console.log(error);
  }
};
