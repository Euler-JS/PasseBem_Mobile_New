import 'package:flutter/material.dart';
import 'package:news_app/services/auth_service.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    try {
      setState(() {
        _isLoading = true;
      });

      final messagesData = await AuthService.getChatMessages();
      
      // Converter mensagens da API para o formato local
      final loadedMessages = messagesData.map((msg) {
        return ChatMessage(
          id: msg['_id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
          text: msg['text']?.toString() ?? '',
          userId: msg['user']?['_id']?.toString() ?? '',
          userName: msg['user']?['name']?.toString() ?? 'Usuário',
          timestamp: msg['createdAt'] != null 
              ? DateTime.parse(msg['createdAt'].toString())
              : DateTime.now(),
          isMe: false, // Será determinado comparando com ID do usuário atual
          imageUrl: msg['image']?.toString(),
          videoUrl: msg['video']?.toString(),
        );
      }).toList();
      
      // Obter ID do usuário atual para marcar mensagens próprias
      final currentUser = await AuthService.getStoredUser();
      if (currentUser != null) {
        for (var msg in loadedMessages) {
          msg.isMe = msg.userId == currentUser.id;
        }
      }
      
      setState(() {
        _messages.clear();
        _messages.addAll(loadedMessages);
        _isLoading = false;
      });
    } catch (e) {
      print('Erro ao carregar mensagens: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    final messageText = _messageController.text;
    _messageController.clear();

    try {
      final success = await AuthService.sendTextMessage(messageText);
      
      if (success) {
        // Recarregar mensagens para obter a nova mensagem do servidor
        await _loadMessages();
      } else {
        // Mostrar erro se falhar
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Erro ao enviar mensagem'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      print('Erro ao enviar mensagem: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erro ao enviar mensagem'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFf0f4fd),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 2,
        title: const Text(
          'Chat Geral',
          style: TextStyle(
            fontSize: 18,
            color: Color(0xFF607d8b),
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: Color(0xFF607d8b)),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Sobre o Chat'),
                  content: const Text(
                    'Chat geral para comunicação entre os usuários do PasseBem.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('OK'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Lista de mensagens
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFffc107),
                    ),
                  )
                : _messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Nenhuma mensagem ainda',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Seja o primeiro a enviar uma mensagem!',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        reverse: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          return _buildMessageBubble(message);
                        },
                      ),
          ),
          
          // Input de mensagem
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Botão de anexos
                  IconButton(
                    icon: const Icon(
                      Icons.add_circle_outline,
                      color: Color(0xFF607d8b),
                    ),
                    onPressed: () {
                      _showAttachmentOptions();
                    },
                  ),
                  
                  // Campo de texto
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFf0f4fd),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _messageController,
                        decoration: const InputDecoration(
                          hintText: 'Digite sua mensagem...',
                          border: InputBorder.none,
                          hintStyle: TextStyle(
                            color: Color(0xFF9E9E9E),
                          ),
                        ),
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Botão enviar
                  Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFffc107),
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send,
                        color: Colors.white,
                      ),
                      onPressed: _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Align(
      alignment: message.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Column(
          crossAxisAlignment:
              message.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!message.isMe)
              Padding(
                padding: const EdgeInsets.only(left: 12, bottom: 4),
                child: Text(
                  message.userName,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF607d8b),
                  ),
                ),
              ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: message.isMe
                    ? const Color(0xFFffc107)
                    : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                message.text,
                style: TextStyle(
                  fontSize: 14,
                  color: message.isMe ? Colors.white : const Color(0xFF212121),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 12, right: 12),
              child: Text(
                _formatTimestamp(message.timestamp),
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[600],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.image, color: Color(0xFFffc107)),
              title: const Text('Enviar Imagem'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implementar envio de imagem
              },
            ),
            ListTile(
              leading: const Icon(Icons.videocam, color: Color(0xFFffc107)),
              title: const Text('Enviar Vídeo'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implementar envio de vídeo
              },
            ),
            ListTile(
              leading: const Icon(Icons.description, color: Color(0xFFffc107)),
              title: const Text('Enviar Documento'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implementar envio de documento
              },
            ),
          ],
        ),
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Agora';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m atrás';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h atrás';
    } else {
      return '${timestamp.day}/${timestamp.month} ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    }
  }
}

class ChatMessage {
  final String id;
  final String text;
  final String userId;
  final String userName;
  final DateTime timestamp;
  bool isMe;
  final String? imageUrl;
  final String? videoUrl;

  ChatMessage({
    required this.id,
    required this.text,
    required this.userId,
    required this.userName,
    required this.timestamp,
    required this.isMe,
    this.imageUrl,
    this.videoUrl,
  });
}
