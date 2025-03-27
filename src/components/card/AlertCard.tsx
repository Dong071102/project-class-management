type AlertCardProps={
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    icon:any;
    title:string;
    description:string;
    bgColor:string;
    borderColor:string;
}

const AlertCard =({icon:Icon, title, description, bgColor, borderColor}:AlertCardProps)=>{
    return (
        <div style={{ backgroundColor: bgColor, borderColor: borderColor }} className="p-4 flex items-start gap-3 rounded-lg border">
            <Icon class="w-6 h-6"style={{ color: borderColor}}/>
            <div className="text-left">
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-gray-700">{description}</p>
            </div>
        </div>
    )
}
export default AlertCard;