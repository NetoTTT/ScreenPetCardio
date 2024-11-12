import serial
import tkinter as tk
from tkinter import ttk, messagebox
import serial.tools.list_ports
import ctypes
import sys

# Função para rodar como administrador
def run_as_admin():
    if ctypes.windll.shell32.IsUserAnAdmin() == 0:
        # Se não for administrador, pede para reiniciar o script como administrador
        script = sys.argv[0]
        params = ' '.join(sys.argv[1:])
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{script}" {params}', None, 1)
        sys.exit()
    else:
        print("Rodando como administrador!")

# Chama a função para verificar se é administrador
run_as_admin()

# Função para listar as portas seriais disponíveis
def list_serial_ports():
    ports = serial.tools.list_ports.comports()
    return [port.device for port in ports]

# Função de leitura da porta serial
def read_ecg_data():
    try:
        # Verifica se há dados na porta antes de tentar ler
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8').strip()  # Lê uma linha da porta serial
            print(f"Linha recebida da porta serial: {line}")  # Debug para ver o que está sendo lido
            if line.startswith("ECG:"):
                value = int(line.split(":")[1].strip())  # Extrai o valor do ECG da linha
                return value
            else:
                return None
        else:
            return None  # Nenhum dado disponível
    except Exception as e:
        print(f"Erro ao ler da porta serial: {e}")
        return None

# Função para atualizar o gráfico no canvas
def update_plot():
    print("Atualizando o gráfico...")  # Debug para verificar se a função está sendo chamada
    ecg_value = read_ecg_data()
    if ecg_value is not None:
        print(f"Valor do ECG: {ecg_value}")  # Debug para verificar o valor do ECG
        ecg_data.append(ecg_value)
        if len(ecg_data) > window_size:
            ecg_data.pop(0)
    
    # Limpa o canvas e redesenha o gráfico
    canvas.delete("all")
    for i in range(1, len(ecg_data)):
        canvas.create_line(i-1, window_height - ecg_data[i-1], i, window_height - ecg_data[i], fill="blue")

    # Atualiza o gráfico após 50ms (ajustando o intervalo para mais rápido)
    root.after(50, update_plot)

# Função chamada quando o botão "Conectar" é pressionado
def connect_to_port():
    global ser
    selected_port = port_combobox.get()
    baud_rate = 115200  # Define a taxa de transmissão como 115200
    if selected_port:
        try:
            # Conecta à porta serial
            ser = serial.Serial(selected_port, baud_rate, timeout=1)
            messagebox.showinfo("Conexão", f"Conectado à porta {selected_port}")
            start_monitoring()  # Inicia o monitoramento após a conexão
        except Exception as e:
            messagebox.showerror("Erro de Conexão", f"Não foi possível conectar à porta {selected_port}. Erro: {e}")
    else:
        messagebox.showwarning("Seleção de Porta", "Por favor, selecione uma porta serial.")

# Função para iniciar o monitoramento
def start_monitoring():
    global canvas, ecg_data, window_size, window_height
    ecg_data = []
    window_size = 100
    window_height = 400  # Altura da janela para desenhar o gráfico

    # Configuração do canvas
    canvas = tk.Canvas(root, width=300, height=window_height)
    canvas.pack()

    # Inicia a atualização do gráfico
    update_plot()

# Função para atualizar a lista de portas seriais
def refresh_ports():
    ports = list_serial_ports()
    port_combobox['values'] = ports
    if ports:
        port_combobox.current(0)  # Seleciona a primeira porta na lista

# Configurações da interface gráfica com tkinter
root = tk.Tk()
root.title("Monitor de ECG")
root.geometry("300x500")

# ComboBox para selecionar a porta serial
tk.Label(root, text="Escolha a porta serial:").pack(pady=10)

port_combobox = ttk.Combobox(root, state="readonly")
port_combobox.pack(pady=10)

# Botão para atualizar as portas seriais disponíveis
refresh_button = tk.Button(root, text="Atualizar Portas", command=refresh_ports)
refresh_button.pack(pady=5)

# Botão para conectar à porta serial selecionada
connect_button = tk.Button(root, text="Conectar", command=connect_to_port)
connect_button.pack(pady=10)

# Inicializar as portas seriais
refresh_ports()

# Rodar a interface gráfica
root.mainloop()
