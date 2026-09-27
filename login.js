const form=document.querySelector("#login-form");
const title=document.querySelector("#login-title");
const intro=document.querySelector("#login-intro");
const confirmWrap=document.querySelector("#confirm-wrap");
const confirmInput=document.querySelector("#confirm");
const submit=document.querySelector("#submit");
const errorEl=document.querySelector("#error");
const tabLogin=document.querySelector("#tab-login");
const tabRegister=document.querySelector("#tab-register");
const passwordInput=document.querySelector("#password");
let mode="login";

function safeNext(){
  const raw=new URLSearchParams(location.search).get("next")||"workspace.html";
  try{
    const decoded=decodeURIComponent(raw);
    return decoded.startsWith("http")||decoded.startsWith("//")?"workspace.html":decoded;
  }catch{return"workspace.html"}
}
function showError(text){errorEl.textContent=text;errorEl.hidden=false}
function hideError(){errorEl.hidden=true;errorEl.textContent=""}
function setMode(next){
  mode=next;hideError();
  const registering=mode==="register";
  tabLogin.classList.toggle("active",!registering);
  tabRegister.classList.toggle("active",registering);
  confirmWrap.hidden=!registering;
  confirmInput.required=registering;
  passwordInput.autocomplete=registering?"new-password":"current-password";
  title.textContent=registering?"注册":"登录";
  intro.textContent=registering
    ?"创建自己的账号。每个人的已读状态与笔记彼此隔离。"
    :"登录后，已读状态和每篇论文的笔记会同步到 Supabase 私有数据库。";
  submit.textContent=registering?"注册并登录":"登录";
}

tabLogin.addEventListener("click",()=>setMode("login"));
tabRegister.addEventListener("click",()=>setMode("register"));

(async()=>{
  if(RadarCloud.token()){
    try{await RadarCloud.me();location.replace(safeNext());return}catch{}
  }
})();

form.addEventListener("submit",async(e)=>{
  e.preventDefault();hideError();submit.disabled=true;
  const username=document.querySelector("#username").value.trim();
  const password=passwordInput.value;
  try{
    if(mode==="register"){
      if(password!==confirmInput.value)throw new Error("两次密码不一致。");
      await RadarCloud.register(username,password);
    }
    await RadarCloud.login(username,password);
    location.replace(safeNext());
  }catch(err){
    if(err.message==="两次密码不一致。")showError(err.message);
    else if(err.code==="username_taken")showError("这个账号已经注册，请直接登录。");
    else if(err.code==="register_rate_limited")showError("注册尝试过多，请一小时后再试。");
    else if(err.code==="rate_limited")showError("登录尝试过多，请 15 分钟后再试。");
    else if(mode==="register")showError("注册失败，请检查账号和密码。密码至少 10 位。");
    else showError("账号或密码不正确。");
  }finally{submit.disabled=false}
});