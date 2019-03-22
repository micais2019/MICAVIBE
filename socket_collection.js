class SocketCollection {
  constructor() {
    this.connections = []
  }
  
  addConnection(conn) {
    this.connections.push(conn) 
  }
  
  removeConnection(conn) {
    console.log("removing connection", this.connections.indexOf(conn)) 
    this.connections.splice(this.connections.indexOf(conn), 1)
    console.log(this.connections.length, "connections remain")
  }
  
  onMessage(message) {
    console.log("fwd", message.length, "bytes")
    let removes = []
    
    this.connections.forEach((conn, idx) => {
      console.log(">> to", idx)
      try {
        conn.send(message)
      } catch (ex) {
        console.error("ERROR PUBLISHING", ex.message)
        removes.push(conn)
      }
    })
    
    removes.forEach(conn => this.removeConnection(conn))
  }
}

module.exports = SocketCollection