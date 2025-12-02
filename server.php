<!-- message definitition
 {
    "type":
    "name":
    "keyPresent":
    "messageText":
 } -->
<?php
include('dbConnection.php');
//some of this file is adapted from PROF Ikeji's sample file
//create and listen to server connection
$EOF=3;

$port = 5000;
$serverSocket = createServerConnection($port);
socket_listen($serverSocket) or die ("unable to start Server, exiting!");
echo "Server now running on $port\n";

//keep list of clients and handshakes
$listOfConnectedClients = [];
$connectedClientsHandshakes = [];
$players = [];

//clear players and screenname tables when server starts
clearTable("players");
clearTable("screenname");

do {
    $clientsWithData = waitForIncomingMessageFromClients($listOfConnectedClients, $serverSocket);

    //check for connection request (happens when the server socket is one of the clients with data)
    if (in_array($serverSocket, $clientsWithData)) {
        	$newSocket = socket_accept($serverSocket);
		// handshake is a mechanisom by which the server and the connecting clients introduce each other,
		// authenticate and establish how they want to communicate/the rules.
		if (performHandshake($newSocket)) {
			$listOfConnectedClients[] = $newSocket;
			echo "connected. #clients: ".count($listOfConnectedClients)."\n";
		}
		else {
			disconnectClient($newSocket, $listOfConnectedClients, $connectedClientsHandshakes, $clientsWithData);
		}
	}
    else { //message is either data or disconnect
        foreach ($clientsWithData as $clientSocket) {
            $len = @socket_recv($clientSocket, $buffer, 1024, 0); //read to either the end of file or 1024 bytes
            if ($len === false || $len == 0 || strlen($message=unmask($buffer)) > 0 && ord($message[0]) == $EOF ) //disconnect or error remove from connection list
            {
                disconnectClient($clientSocket, $listOfConnectedClients, $connectedClientsHandshakes, $clientsWithData);
            }
            else { //message is either a chatroom-message or an added-message
                if (!empty($message))
                {
                    $contents = json_decode($message);

                    if ($contents === null) {
                        echo "Message type unknown or invalid JSON: $message\n";
                        continue; // skip to next client
                    }

                    switch ($contents->type) {
                        case 'LOGIN-screen-name':
                            //login logic
                            break;
                        case 'NEW-GAME':
                            //new game logic
                            break;
                        case 'JOIN':
                            //join logic
                            break;
                        case 'MOVE':
                            //move logic
                            break;
                        case 'END-GAME':
                            //end game logic
                            break;
                        //old options from chatroom server
                        //new room added to the list
                        // case 'added-room' :
                        //     $name = $contents->chatroomName;
                        //     $keyPresent = $contents->keyPresent;

                        //     //send messages to all clients to add the new room to the top of the list
                        //     updateChatroomLists($listOfConnectedClients, $name, $keyPresent);
                        //     break;

                        // case "user-joined":
                        //     $room = $contents->room ?? '';
                        //     $screenName = $contents->screenName ?? '';

                        //     if (!$room || !$screenName) break;

                        //     // initialize room if it doesn't exist
                        //     if (!isset($clientsInRooms[$room])) {
                        //         $clientsInRooms[$room] = [];
                        //     }

                        //     // add client socket to the room if not already present
                        //     if (!in_array($clientSocket, $clientsInRooms[$room], true)) {
                        //     $clientsInRooms[$room][] = $clientSocket;

                        //     // store handshake info keyed by socket ID
                        //         $sockId = spl_object_id($clientSocket);
                        //         $connectedClientsHandshakes[$sockId] = [
                        //             'screenName' => $screenName
                        //         ];
                        //     }

                        //     // broadcast join message to all in the room
                        //     $joinMessage = [
                        //         "type" => "user-joined",
                        //         "room" => $room,
                        //         "screenName" => $screenName,
                        //         "messageText" => "$screenName has joined the room."
                        //     ];
                        //     $frame = mask(json_encode($joinMessage));

                        //     foreach ($clientsInRooms[$room] as $sock) {
                        //         socket_write($sock, $frame, strlen($frame));
                        //     }
                        //     break;

                        // case "user-left":
                        //     $room = $contents->roomName ?? '';
                        //     $screenName = $contents->screenName ?? '';

                        //     if (!$room || !isset($clientsInRooms[$room])) break;

                        //     // remove leaving user from room
                        //     foreach ($clientsInRooms[$room] as $key => $sock) {
                        //         $sockId = spl_object_id($sock);
                        //         $handshake = $connectedClientsHandshakes[$sockId] ?? null;
                        //         if ($handshake && $handshake['screenName'] === $screenName) {
                        //             unset($clientsInRooms[$room][$key]);
                        //             unset($connectedClientsHandshakes[$sockId]);
                        //         }
                        //     }

                        //     // reindex room array
                        //     $clientsInRooms[$room] = array_values($clientsInRooms[$room]);

                        //     // broadcast leave message to remaining clients
                        //     $leaveMessage = [
                        //         "type" => "user-left",
                        //         "roomName" => $room,
                        //         "screenName" => $screenName,
                        //         "messageText" => "$screenName has left the room."
                        //     ];
                        //     $frame = mask(json_encode($leaveMessage));

                        //     foreach ($clientsInRooms[$room] as $sock) {
                        //         socket_write($sock, $frame, strlen($frame));
                        //     }
                        // break;

                        // case "chatroom-message":
                        //     // grab what was sent to server
                        //     $room = $contents->roomName ?? '';
                        //     $screenName = $contents->screenName ?? '';
                        //     $messageText = $contents->message ?? '';

                        //     if (!$room || !isset($clientsInRooms[$room])) break;

                        //     $chatMessage = [
                        //         "type" => "chatroom-message",
                        //         "roomName" => $room,
                        //         "screenName" => $screenName,
                        //         "messageText" => $messageText
                        //     ];
                        //     $frame = mask(json_encode($chatMessage));

                        //     foreach ($clientsInRooms[$room] as $sock) {
                        //         socket_write($sock, $frame, strlen($frame));
                        //     }
                        // break;
                default:
                    echo "Unknown message type: {$contents->type}\n";
                    break;
                }

                }
            }
        }
    }
} while (true);

// Create server socket for others to connect to and communicate with
function createServerConnection($port, $host=0) {
	// Create TCP/IP streaming socket
	$serverSocket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	// Set option for the port to be reusable
	socket_set_option($serverSocket, SOL_SOCKET, SO_REUSEADDR, 1);
	// Bind the socket to $port and to the $host given. Default host is 0 i.e. localhost
	socket_bind($serverSocket, $host, $port);
	return $serverSocket;
}

function waitForIncomingMessageFromClients ($clients, $serverSocket) {
	$readList = $clients;		// start with list of clients for read list
	$readList[] = $serverSocket;	// append server socket so we can also detect connect requests
	$writeList = $exceptionList = [];	// We use empty for these

	// Loop until a read, connect or disconnect request
	socket_select($readList, $writeList, $exceptionList, NULL);
	return $readList;
}

// handshake is a mechanisom by which the server and the connecting clients introduce each other,
// authenticate and establish how they want to communicate/the rules.
function performHandshake($clientSocket) {
	$len = @socket_recv($clientSocket, $headers, 1024, 0); // read to eoln or 1024 bytes
	if ($len === false || $len == 0) return false; // disconnected
	$headers = explode("\r\n", $headers);
    	$headerArray = [];
    	foreach ($headers as $header) {
        	$parts = explode(": ", $header);
        	if (count($parts) === 2) $headerArray[$parts[0]] = $parts[1];
	}

	// this is not a strict handshake because we don't enforce that the Sec-WebSocket-Keys match, we only want to see the Key
	if (!isset($headerArray['Sec-WebSocket-Key'])) return false;
	$secKey = $headerArray['Sec-WebSocket-Key'];
	$uuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"; // Fixed constant for hand shakes
    	$secAccept = base64_encode(pack('H*', sha1($secKey . $uuid)));
    	$handshakeResponse = "HTTP/1.1 101 Switching Protocols\r\n" .
        	"Upgrade: websocket\r\n" .
        	"Connection: Upgrade\r\n" .
        	"Sec-WebSocket-Accept: $secAccept\t\r\n\r\n";
	socket_write($clientSocket, $handshakeResponse, strlen($handshakeResponse));
	return true;
}

// Masking and unmasking of the messages is highly recommend because websockets are implemented
// via the http connection. If the message is not masked it may be misinterpreted by the http server
// as a regular http message rather than a websocket message.
// mask and unmask functions from: https://piehost.com/websocket/build-a-websocket-server-in-php-without-any-library
function unmask($payload) {
    if (strlen($payload)==0) return "";
    $length = ord($payload[1]) & 127;
    if ($length == 126) {
        $masks = substr($payload, 4, 4);
        $data = substr($payload, 8);
    } elseif ($length == 127) {
        $masks = substr($payload, 10, 4);
        $data = substr($payload, 14);
    } else {
        $masks = substr($payload, 2, 4);
        $data = substr($payload, 6);
    }
    $unmaskedtext = '';
    for ($i = 0; $i < strlen($data); ++$i) {
        $unmaskedtext .= $data[$i] ^ $masks[$i % 4];
    }
    return $unmaskedtext;
}

function mask($message) {
    $frame = [];
    $frame[0] = 129;

    $length = strlen($message);
    if ($length <= 125) {
        $frame[1] = $length;
    } elseif ($length <= 65535) {
        $frame[1] = 126;
        $frame[2] = ($length >> 8) & 255;
        $frame[3] = $length & 255;
    } else {
        $frame[1] = 127;
        $frame[2] = ($length >> 56) & 255;
        $frame[3] = ($length >> 48) & 255;
        $frame[4] = ($length >> 40) & 255;
        $frame[5] = ($length >> 32) & 255;
        $frame[6] = ($length >> 24) & 255;
        $frame[7] = ($length >> 16) & 255;
        $frame[8] = ($length >> 8) & 255;
        $frame[9] = $length & 255;
    }

    foreach (str_split($message) as $char) {
        $frame[] = ord($char);
    }

    return implode(array_map('chr', $frame));
}

function updateChatroomLists($listOfClients, $chatroomName, $keyPresent) {
    $data = [
        "type" => "update_room_lists",
        "name" => $chatroomName,
        "keyPresent" => $keyPresent
    ];
    $jsonData = json_encode($data);
    $frame = mask($jsonData);
    $frameLen = strlen($frame);
    foreach ($listOfClients as $client) {
        socket_write($client, $frame, $frameLen);
    }
}

function disconnectClient($clientSocket, &$listOfConnectedClients, &$connectedClientsHandshakes, &$clientsWithData)
{
    //todo remove client from players array as well as any tables they may be in
    if (($clientKey = array_search($clientSocket, $clientsWithData)) !== false) {	// find the index
        unset($clientsWithData[$clientKey]);				// zap it from the list
    }
    if (($clientKey = array_search($clientSocket, $listOfConnectedClients)) !== false) { // find the index
        unset($listOfConnectedClients[$clientKey]);			// zap it from the list
        unset($connectedClientsHandshakes[$clientKey]);			// zap it from the list
        echo "disconnected client\n";
    }
    socket_close($clientSocket);	// close the connection to it
}

//todo add database connections
function clearTable($tableName) {
    global $conn;
    $stmt = $conn->prepare("TRUNCATE TABLE ?");
    $stmt->bind_param("s", $tableName);

    if($stmt->execute()) {
        echo "SUCCESS: truncated table" . $$tableName;
    } else {
        echo "ERROR truncating table.";
    }

    $stmt->close();
}
?>