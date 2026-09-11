self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch{data={body:event.data?event.data.text():'Nova encomenda DONART'};}
  event.waitUntil((async()=>{
    const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
    const visible=windows.find(c=>c.visibilityState==='visible');
    if(visible){
      try{visible.postMessage({type:'DONART_PUSH_ORDER',payload:data});}catch{}
      return;
    }
    const title=data.title||'DONART · Nova encomenda';
    const orderId=String(data?.data?.orderId||data?.data?.publicId||data?.orderId||'').trim();
    const options={
      body:data.body||'Recebeste uma nova encomenda.',
      icon:data.icon||'./icon-192.png',
      badge:data.badge||'./icon-192.png',
      tag:data.tag||(orderId?'donart-order-'+orderId:'donart-order-'+Date.now()),
      renotify:data.renotify!==false,
      data:data.data||{url:orderId?'./?pushOrder='+encodeURIComponent(orderId):'./'}
    };
    if(!options.data.url&&orderId)options.data.url='./?pushOrder='+encodeURIComponent(orderId);
    await self.registration.showNotification(title,options);
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'./';
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      try{
        if('focus' in client){
          if('navigate' in client)await client.navigate(target);
          await client.focus();
          return;
        }
      }catch{}
    }
    if(clients.openWindow)return clients.openWindow(target);
  })());
});
