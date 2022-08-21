var data = {
  "user_list": [
    {
      "user_id": "1244",
      "nick_name": "aaa",
      "friends": {
        "user_id": "222",
        "nick_name": "bbb",
      },
      "user_add_tel": "213131",
    },
    {
      "userId": "1222",
      "nick_name": "gekewo"
    }
  ]
}

const translate = (data) => {
  
  const deepFn = (value) => {

    if (Array.isArray(value)) {
      return value.map((item) => deepFn(item));
    }
    if (typeof value === 'object') {
      const rtn = {};
      for(let key in value) {
        const newKey = key.replace(/_([a-z])/g, function(full, ...group) {
          let lowCase = group[0];
          return String.fromCharCode(lowCase.charCodeAt(0) - 32);
        });
        rtn[newKey] = typeof value[key] == 'object' ? deepFn(value[key]) : value[key];
      }
      return rtn;
    }
    return value;
  }
  return deepFn(data);
}

const camelData = translate(data);
console.log(JSON.stringify(camelData));