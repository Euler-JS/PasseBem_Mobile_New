import React ,{useRef, useMemo}from "react";
import { View, StatusBar,Image, TouchableOpacity, FlatList, ScrollView, Dimensions, SafeAreaView, Share} from "react-native";
import {Text, Divider, LinearProgress } from "react-native-elements";
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from "../context/auth";




const image = "data:image/jpeg;base64,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"

const { width, height} = Dimensions.get("screen")
const data = [1,2,3,4]

const PerfilScreen = ({navigation}) => {


    const { LogOut, user} = useAuth();

    const onShare = async () => {
        try {
          const result = await Share.share({
            message: 'Já está disponível a nova versão da "Passe Bem", encontre: \n* Apontamentos para leitura antes e depois de realizar os testes temáticos; \n* Acesso a video aulas online, de código de estrada (condições já criadas para arranque em datas a anunciar); \n*Partilha de vídeos do primeiro carro/primeira condução com habilitação para conduzir; \n*Acompanhamento através de gráficos do domínio dos temas e dos testes em geral; \n*Actualização da transitabilidade das vias em tempo real através de um mural; https://play.google.com/store/apps/details?id=mz.co.passebem.passebem2',
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          alert(error.message);
        }
      };

    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#f0f4fd"}}>
            <ScrollView>
            
                <View style={{width:width*0.9, alignSelf:"center",  marginTop:height*0.04, alignItems:"center"}}>
                    <View>
                        <Image source={{uri:user?.user_inf?.perfil_url || image}} style={{ height:width*0.26, width:width*0.26, borderRadius:50, resizeMode:"cover"}}/>
                    </View>
                    
                    <Text style={{fontWeight:"700", fontSize:19}}>{user?.user_inf?.nome || 'Usuario'}</Text>
                    <Text>{user?.user_inf?.email||'exmple@gmial.com'}</Text>
                    <TouchableOpacity disabled style={{marginVertical:height*0.014, backgroundColor:"#ddd", width:width*0.45, height:height*0.04, borderRadius:20, justifyContent:"center", alignItems:"center"}}>
                        <Text style={{fontWeight:"700", color:"#fff", fontSize:15}}>Upgrade to PRO</Text>
                    </TouchableOpacity>
                </View>

                <View style={{width:width*0.9, alignSelf:"center", alignItems:"center"}}>

                    <TouchableOpacity onPress={() => navigation.navigate("EditPerfil")} style={{marginVertical:height*0.014, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <FontAwesome5 name="user-shield" size={24} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Privacidade</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={() => navigation.navigate('CategoriaPage')}
                        style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="file-copy" size={24} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Material Didáctico</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('HistProva')}
                        style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="history" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Histórico Academico</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=> navigation.navigate('HistPymentScreen')}
                    style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="history" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Histórico de Compras</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('SupportScreen')} style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="help-outline" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Ajuda e Suporte</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity disabled style={{marginVertical:height*0.01, backgroundColor:"#ddd", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="settings" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Definições</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=> onShare()}  style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.9, height:height*0.058, borderRadius:20, justifyContent:"space-between", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="person-add-alt-1" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Convidar um amigo</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={30} color="#607d8b" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={()=> LogOut()}
                     style={{marginVertical:height*0.01, backgroundColor:"#fff", flexDirection:"row", paddingHorizontal:width*0.03,
                        width:width*0.3, height:height*0.058, borderRadius:20, justifyContent:"center", alignItems:"center"}}>
                            <View style={{flexDirection:"row", alignItems:"center",}}>
                                <MaterialIcons name="logout" size={30} color="#607d8b" />
                                <Text style={{fontWeight:"700", color:"#607d8b", fontSize:16, marginLeft:width*0.07}}>Sair</Text>
                            </View>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PerfilScreen;