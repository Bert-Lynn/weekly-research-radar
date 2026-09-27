const RadarCloud=(()=>{
  const API="https://lweqhvangoswprmugfhv.supabase.co/functions/v1/research-radar-api";
  const API_KEY="sb_publishable_PGRepsf4rdDgyvqgRbEKFw_RijkiEu2";
  const TOKEN_KEY="research_radar_session_v1";

  function token(){return localStorage.getItem(TOKEN_KEY)||""}
  function setToken(value){value?localStorage.setItem(TOKEN_KEY,value):localStorage.removeItem(TOKEN_KEY)}
  async function request(action,payload={},withAuth=false){
    const headers={"Content-Type":"application/json","apikey":API_KEY};
    if(withAuth&&token()) headers.Authorization="Bearer "+token();
    const res=await fetch(API,{method:"POST",headers,body:JSON.stringify({action,...payload})});
    let data={};
    try{data=await res.json()}catch{}
    if(!res.ok) throw Object.assign(new Error(data.error||"request_failed"),{status:res.status,code:data.error});
    return data;
  }
  async function login(username,password){
    const data=await request("login",{username,password});
    setToken(data.token||"");
    return data;
  }
  async function initialize(username,password){
    return request("initialize",{username,password});
  }
  async function me(){
    try{return await request("me",{},true)}catch(e){if(e.status===401)setToken("");throw e}
  }
  async function list(week){return request("list",{week},true)}
  async function upsert({week,paperKey,isRead,note}){return request("upsert",{week,paperKey,isRead,note},true)}
  async function logout(){
    try{if(token())await request("logout",{},true)}finally{setToken("")}
  }
  return{request,status:()=>request("status"),initialize,login,me,list,upsert,logout,token,setToken,TOKEN_KEY};
})();