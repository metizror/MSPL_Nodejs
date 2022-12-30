const message={
    food_delivery:{
        orders:{
                eng:{
                    pending : "You have a new order request ",
                    confirmed: "Your order has been ",
                    rejected: "Your order has been ",
                    on_the_way: "Your order is ",
                    near_you: "Your order is ",
                    delivered : "Your order has been ",
                    rating_given: "Your order ",
                    track : "order tracked ",
                    cancelled : "Your order has been ",
                    shipped : "Your order has been ",
                    ready_to_be_picked: "Your order is ",
                    packed : "Your order is ",
                    in_the_kitchen:"Your order is ",
                    table_booking:"you got a new table booking request"
                },
                arb:{    
                    pending : "قيد الانتظار",
                    confirmed: "تم تأكيد طلبك",
                    rejected: "تم رفض طلبك",
                    on_the_way: "علي الطريق",
                    near_you: "بالقرب منك",
                    delivered : "لقد تم تسليم طلبك",
                    rating_given: "تقييم معين",
                    track : "تتبع الطلب",
                    shipped : "your order has been",
                    cancelled : "تم إلغاء طلبك",
                    ready_to_be_picked: "طلبك جاهز ليتم انتقاؤه",
                    in_the_kitchen: "في المطبخ",
                    packed : "ترتيب معبأة",
                    table_booking:"حصلت على طلب حجز طاولة جديد"
                },
                spanish:{    
                    pending : "Tienes una nueva solicitud de pedido ",
                    confirmed: "Tu orden ha sido confirmada!",
                    rejected: "Tu orden ha sido ",
                    on_the_way: "Orden en camino!",
                    near_you: "Su orden es ",
                    delivered : "Tu orden ha sido entregada. Disfrutala!",
                    rating_given: "Su pedido ",
                    track : "orden rastreada",
                    cancelled : "Tu orden ha sido cancelada por el local. Si hiciste un pago online haremos el reembolso en 24 horas.",
                    shipped : "Tu orden ha sido ",
                    ready_to_be_picked: "Tu orden está lista para ser recogida por un Yummer",
                    packed : "Tu orden ",
                    in_the_kitchen:"Tu orden está en la cocina",
                    table_booking:"tienes una nueva solicitud de reserva de mesa"
                }
        },
        errorMessages:{
            eng : {
                ratingErorr : {
                    already_rate : "You already rate this food item",
                    rating_error : "Sorry! You Can't Rate This food item"
                },
                suppliererror:{
                    supplier_does_not_deliver_in_your_area : "Supplier does not deliver in your area"
                } 
            },
            arb : {
                ratingErorr : {
                    already_rate : "You already rate this food item",
                    rating_error : "Sorry! You Can't Rate This food item"
                },
                suppliererror:{
                    supplier_does_not_deliver_in_your_area : "Supplier does not deliver in your area"
                } 
            }
        }
    },
    ecommerce:{

            orders:{
                    eng:{
                        pending : "You have a new order request ",
                        confirmed: "Your order has been ",
                        rejected: "Your order has been ",
                        on_the_way: "Your order is ",
                        near_you: "Your order is ",
                        delivered : "Your order has been ",
                        rating_given: "Your order ",
                        track : "order tracked",
                        cancelled : "Your order has been ",
                        shipped : "Your order has been ",
                        ready_to_be_picked: "Your order is ",
                        packed : "Your order is ",
                        in_the_kitchen:"Your order is "
                    },
                    arb:{
                        pending : "قيد الانتظار",
                        confirmed: "تمت الموافقة على طلبك",
                        rejected: "تم رفض طلب",
                        on_the_way: "علي الطري",
                        near_you: "بالقرب منك",
                        delivered : "تم التوصيل",
                        rating_given: "تقييم معين",
                        track : "مسار",
                        cancelled : "تم إلغاء طلبك",
                        shipped : "ترتيب شحنها",
                        ready_to_be_picked: "طلبك جاهز ليتم انتقاؤه",
                        packed : "ترتيب معبأة",
                        in_the_kitchen: "في المطبخ"

                    }
            },
            errorMessages:{
                eng : {
                    ratingErorr : {
                        already_rate : "You already rate this product",
                        rating_error : "Sorry! You Can't Rate This Product"
                    },
                    suppliererror:{
                        supplier_does_not_deliver_in_your_area : "Supplier does not deliver in your area"
                    }           
                },
                arb : {
                    ratingErorr : {
                        already_rate : "You already rate this food item",
                        rating_error : "Sorry! You Can't Rate This Product"
                    },
                    suppliererror:{
                        supplier_does_not_deliver_in_your_area : "Supplier does not deliver in your area"
                    }           
    
                }
            }
    },
    home_service:{
        orders:{
            eng:{
                pending : "You recieved a new booking request ",
                confirmed: "Your booking has been ",
                rejected: "Your order has been ",
                on_the_way: "Service ",
                near_you: "Agent is ",
                delivered : "Service ",
                rating_given: "Your order ",
                track : "order tracked",
                cancelled : "Your order has been ",
                shipped : "Service ",
                ready_to_be_picked: "Agent ",
                packed : "Agent is ",
                in_the_kitchen:"Agent is "
            },
            arb:{
                pending : "قيد الانتظار",
                confirmed: "تمت الموافقة على طلبك",
                rejected: "تم رفض طلب",
                on_the_way: "علي الطري",
                near_you: "بالقرب منك",
                delivered : "تم التوصيل",
                rating_given: "تقييم معين",
                track : "مسار",
                cancelled : "تم إلغاء طلبك",
                shipped : "ترتيب شحنها",
                ready_to_be_picked: "طلبك جاهز ليتم انتقاؤه",
                packed : "ترتيب معبأة",
                in_the_kitchen: "في المطبخ"

            }
         },
         errorMessages:{
            eng : {
                ratingErorr : {
                    already_rate : "You already rate this Service",
                    rating_error : "Sorry! You Can't Rate This Service"
                },
                suppliererror:{
                    supplier_does_not_deliver_in_your_area : "Service Provider does not provide service in your area"
                }           
             },
            arb : {
                ratingErorr : {
                    already_rate : "You already rate this Service",
                    rating_error : "Sorry! You Can't Rate This Service"
                },
                suppliererror:{
                    supplier_does_not_deliver_in_your_area : "Service Provider does not provide service in your area"
                }           
        }
    }
    },
    common:{
        payment:{
            en:{
                no_gate_way:"Sorry payment gateway are not integrated",
                error:"Sorry payment failed !"
            },
            arb:{
                no_gate_way:"آسف بوابة الدفع ليست متكاملة",
                error:"سف فشل الدفع!"
            }
        }
    },
    notification:{
        enable:{
            en:{
                success:"Notifications enabled"
            },
            arb:{
                success: "تم تمكين الإشعارات"
            }
        },
        disable:{
            en:{
                success:"Notifications disable"
            },
            arb:{
                success: "الإخطارات تعطيل"
            }
        }
    }
}
const service={
    ecommerce:2,
    food:1,
    home_service:3
}


module.exports={
    message:message
}