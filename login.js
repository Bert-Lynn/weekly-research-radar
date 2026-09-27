const form=document.querySelector("#login-form");
const title=document.querySelector("#login-title");
const intro=document.querySelector("#login-intro");
const setup=document.querySelector("#setup-banner");
const confirmWrap=document.querySelector("#confirm-wrap");
const confirmInput=document.querySelector("#confirm");
const submit=document.querySelector("#submit");
const errorEl=document.querySelector("#error");
let initialized=true;

function safeNext(){
  const raw=new URLSearchParams(location.search).get("next")||"workspace.html";
  try{
    const decoded=decodeURIComponent(raw);
    return decoded.startsWith("http")||decoded.startsWith("//")?"workspace.html":decoded;
  }catch{return"workspace.html"}
}
function showError(text){errorEl.textContent=text;errorEl.hidden=false}
function hideError(){errorEl.hidden=true;errorEl.textContent=""}

(async()=>{
  if(RadarCloud.token()){
    try{await RadarCloud.me();location.replace(safeNext());return}catch{}
  }
  try{
    const s=await RadarCloud.status();
    initialized=Boolean(s.initialized);
    if(!initialized){
      title.textContent="首次初始化";
      intro.textContent="创建这个站点唯一的私有账号。初始化完成后将不能再注册第二个账号。";
      setup.hidden=false;confirmWrap.hidden=false;confirmInput.required=true;
      submit.textContent="初始化并登录";
    }
  }catch{showError("无法连接 Supabase，请稍后刷新。")}
})();

form.addEventListener("submit",async(e)=>{
  e.preventDefault();hideError();submit.disabled=true;
  const username=document.querySelector("#username").value.trim();
  const password=document.querySelector("#password").value;
  try{
    if(!initialized){
      if(password!==confirmInput.value)throw new Error("两次密码不一致。");
      await RadarCloud.initialize(username,password);
    }
    await RadarCloud.login(username,password);
    location.replace(safeNext());
  }catch(err){
    if(err.code==="rate_limited")showError("登录尝试过多，请 15 分钟后再试。");
    else if(err.code==="already_initialized")showError("账号已经初始化，请刷新后直接登录。");
    else if(err.message==="两次密码不一致。")showError(err.message);
    else showError(initialized?"账号或密码不正确。":"初始化失败，请检查输入后重试。");
  }finally{submit.disabled=false}
});