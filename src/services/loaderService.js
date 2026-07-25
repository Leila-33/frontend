let loaderCallback = null;


export function registerLoader(callback) {

  loaderCallback = callback;

}



let pendingRequests = 0;


export function startLoading(){

 pendingRequests++;

 loaderCallback?.(
   pendingRequests > 0
 );

}



export function stopLoading(){

 pendingRequests--;

 if(pendingRequests < 0)
   pendingRequests = 0;


 loaderCallback?.(
   pendingRequests > 0
 );

}