self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch{data={body:event.data?event.data.text():'Nova encomenda DONART'};}
  const title=data.title||'DONART · Nova encomenda';
  const options={
    body:data.body||'Recebeste uma nova encomenda.',
    icon:data.icon||'./icon-192.png',
    badge:data.badge||'./icon-192.png',
    tag:data.tag||'donart-order',
    renotify:Boolean(data.renotify),
    data:data.data||{url:'./'}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'./';
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      try{
        if('focus' in client){
          await client.focus();
          if('navigate' in client)await client.navigate(target);
          return;
        }
      }catch{}
    }
    if(clients.openWindow)return clients.openWindow(target);
  })());
});
