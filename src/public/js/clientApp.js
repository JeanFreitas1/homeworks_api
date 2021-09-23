const loginInput = document.querySelector('.username-input');
const passwordInput = document.querySelector('.password-input');
const formAlertDOM = document.querySelector('.form-alert');

//selectors dos containers principais
const allFiles = document.querySelector('.allfiles');
const formDOM = document.querySelector('.login-form');

//carregar o loader spinner
const loadingSpinner = document.querySelector('.infront');
const uploadInfo = document.querySelector('.upload-info');

//htmlInner
const innerResult = document.querySelector('.allfiles-class');

//submit login
formDOM.addEventListener('submit', async (e) => {
  e.preventDefault();
  const login = loginInput.value;
  const password = passwordInput.value;

  try {
    const {
      data: { accessToken, refreshToken },
    } = await axios.post('/api/v1/login', { login, password });
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    //get token and insert into local storage
    loadPage();
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

//LOADING PAGE HERE
const loadPage = async () => {
  formDOM.style.display = 'none';
  allFiles.style.display = 'none';

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken && !refreshToken) {
    //dont have access
    formDOM.style.display = 'block';
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
      formDOM.style.display = 'block';
      return;
    }
  } catch (err) {
    if (err.response.status === 401) {
      checkRefreshToken(refreshToken);
    }
    console.log(err);
  }

  try {
    const {
      data: { success, data: dataInfo },
    } = await axios.get(`/api/v1/files`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(dataInfo);
    if (dataInfo.length === 0) {
      innerResult.innerHTML = '';
      allFiles.style.display = 'block';
      innerResult.innerHTML = `<h4>No items in storage</h4>`;
      return;
    }
    // console.log(dataInfo);
    if (success === true) {
      formDOM.style.display = 'none';
      allFiles.style.display = 'block';
      // console.log(dataInfo);
      innerResult.innerHTML = '';
      dataInfo.forEach((item) => {
        innerResult.innerHTML += `<div class="result"><p>${item.filename}</p>
          <i onclick="return downloadbtn('${item.filename}')" class="fas fa-file-download"></i>
          <i onclick="return deletebtn('${item.filename}')" class="fas fa-trash-alt"></i></div>`;
      });
    }

    // console.log(success);
    // console.log(dataInfo);
  } catch (error) {
    // console.log(error.response.status);
  }
};

loadPage();

const downloadbtn = async (key) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const {
      data: { success, message },
    } = await axios.get(`/api/v1/files/${key}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log(message);
    if (success === true) {
      window.open(message, '_blank');
    }
  } catch (error) {
    // console.log(error);
    document.location.reload();
  }
};

const deletebtn = async (key) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const {
      data: { success },
    } = await axios.delete(`/api/v1/files/${key}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (success === true) {
      loadPage();
    }
  } catch (error) {
    // console.log(error);

    loadPage();
  }
};

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

const uploadbtn = async () => {
  const fileImput = document.getElementById('file-select');
  const file = fileImput.files[0];
  const accessToken = localStorage.getItem('accessToken');
  // loadingSpinner.style.visibility = 'visible';

  if (!file) {
    console.log('You need to select a file');
    setTimeout(() => {
      loadingSpinner.style.visibility = 'hidden';
    }, 1000);
    return;
  }

  const { name, size, type } = file;
  loadingSpinner.style.visibility = 'visible';
  try {
    let res = await axios.post(
      `api/v1/files/getUploadId`,
      { fileName: name },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const uploadId = res.data.uploadId;
    // console.log(res);

    // In react use useState. Beacause we are using plain javascript, I've used session storage to store the uploadID which we can use later to abort upload process
    sessionStorage.setItem('uploadId', uploadId);

    // console.log('Inside uploadMultipartFile');
    const chunkSize = 10 * 1024 * 1024; // 10MiB
    const chunkCount = Math.floor(size / chunkSize) + 1;
    // console.log(`chunkCount: ${chunkCount}`);

    let multiUploadArray = [];

    for (let uploadCount = 1; uploadCount < chunkCount + 1; uploadCount++) {
      let start = (uploadCount - 1) * chunkSize;
      let end = uploadCount * chunkSize;
      let fileBlob =
        uploadCount < chunkCount ? file.slice(start, end) : file.slice(start);

      let getSignedUrlRes = await axios.post(
        `api/v1/files/getUploadPart`,
        {
          fileName: name,
          partNumber: uploadCount,
          uploadId: uploadId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      let preSignedUrl = getSignedUrlRes.data.preSignedUrl;
      // console.log(`preSignedUrl ${uploadCount} : ${preSignedUrl}`);
      // console.log(fileBlob);
      // Start sending files to S3 part by part

      //magia do upload progress
      const onUploadProgress = (event) => {
        const defaultPercent = Math.round(
          ((event.loaded + start) * 100) / size
        );
        uploadInfo.innerHTML = defaultPercent + '%';
        // console.log('onUploadProgress', defaultPercent);
      };

      let uploadChunck = await axios.put(preSignedUrl, fileBlob, {
        onUploadProgress,
      });
      // console.log('its the chunck obj ');
      // console.log(uploadChunck);
      let EtagHeader = uploadChunck.headers.etag;
      // console.log(EtagHeader);
      let uploadPartDetails = {
        ETag: EtagHeader,
        PartNumber: uploadCount,
      };
      multiUploadArray.push(uploadPartDetails);
    }

    // console.log(multiUploadArray);
    const completeUpload = await axios.post(
      `api/v1/files/completeUpload`,
      {
        fileName: name,
        parts: multiUploadArray,
        uploadId,
        size,
        type,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(completeUpload.data, 'complete upload response');
    loadingSpinner.style.visibility = 'hidden';
    loadPage();
  } catch (err) {
    loadingSpinner.style.visibility = 'hidden';
    console.log(err, err.stack);
    loadPage();
  }
};
