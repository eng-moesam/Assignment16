class CustomError extends Error{
  constructor(
    message:string,
    public statuscode:number,
    cause?:unknown){

    super(message,{cause});
     this.name =this.constructor.name
    
  }
}

export default CustomError